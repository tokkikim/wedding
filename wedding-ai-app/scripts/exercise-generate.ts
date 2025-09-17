import { NextRequest } from "next/server";
import type { UploadApiOptions } from "cloudinary";

async function main() {
  process.env.NODE_ENV = "test";
  process.env.TEST_SESSION_USER_ID = "test-user";
  process.env.GEMINI_API_KEY = "";
  process.env.CLOUDINARY_CLOUD_NAME = "demo";
  process.env.CLOUDINARY_API_KEY = "demo";
  process.env.CLOUDINARY_API_SECRET = "demo";
  process.env.GOOGLE_CLIENT_ID = "demo";
  process.env.GOOGLE_CLIENT_SECRET = "demo";

  const { v2: cloudinary } = await import("cloudinary");
  const mockUpload = async (
    _data: string,
    options?: UploadApiOptions
  ): Promise<{ secure_url: string; public_id: string }> => {
    const publicId =
      typeof options?.public_id === "string" ? options.public_id : "mock";

    return {
      secure_url: `https://res.cloudinary.com/demo/image/upload/${publicId}.jpg`,
      public_id: publicId,
    };
  };

  cloudinary.uploader.upload =
    mockUpload as unknown as typeof cloudinary.uploader.upload;

  type GeneratedRecord = {
    id: string;
    userId: string;
    originalUrl: string;
    generatedUrl?: string;
    prompt: string;
    style: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
  };

  const generatedRecords: GeneratedRecord[] = [];
  let credits = 3;

  interface UserFindUniqueArgs {
    where: { id: string };
  }

  interface UserUpdateArgs {
    data: { credits?: { decrement?: number } };
  }

  interface GeneratedCreateArgs {
    data: {
      userId: string;
      originalUrl: string;
      prompt: string;
      style: string;
      status: string;
    };
  }

  interface GeneratedUpdateArgs {
    where: { id: string };
    data: Partial<Pick<GeneratedRecord, "generatedUrl" | "status">>;
  }

  type PrismaMock = {
    user: {
      findUnique(args: UserFindUniqueArgs): Promise<{ credits: number } | null>;
      update(args: UserUpdateArgs): Promise<{ id: string; credits: number }>;
    };
    generatedImage: {
      create(args: GeneratedCreateArgs): Promise<GeneratedRecord>;
      update(args: GeneratedUpdateArgs): Promise<GeneratedRecord>;
    };
  };

  const prismaMock: PrismaMock = {
    user: {
      findUnique: async ({ where }: UserFindUniqueArgs) =>
        where.id === process.env.TEST_SESSION_USER_ID ? { credits } : null,
      update: async ({ data }: UserUpdateArgs) => {
        const decrement = data.credits?.decrement ?? 0;
        credits -= decrement;
        return { id: process.env.TEST_SESSION_USER_ID ?? "test-user", credits };
      },
    },
    generatedImage: {
      create: async ({ data }: GeneratedCreateArgs) => {
        const record: GeneratedRecord = {
          ...data,
          id: `gen_${generatedRecords.length + 1}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        generatedRecords.push(record);
        return record;
      },
      update: async ({ where, data }: GeneratedUpdateArgs) => {
        const record = generatedRecords.find((item) => item.id === where.id);
        if (!record) {
          throw new Error("Record not found");
        }
        Object.assign(record, data, { updatedAt: new Date() });
        return record;
      },
    },
  };

  (globalThis as { prisma?: unknown }).prisma = prismaMock;

  const { POST } = await import("../src/app/api/generate/route");

  const sharpModule = await import("sharp");
  const sampleImage = await sharpModule.default({
    create: {
      width: 640,
      height: 480,
      channels: 3,
      background: "#f7d6e0",
    },
  })
    .jpeg({ quality: 95 })
    .toBuffer();

  const file = new File([sampleImage], "sample.jpg", { type: "image/jpeg" });

  const formData = new FormData();
  formData.append("image", file);
  formData.append("style", "vintage");
  formData.append("prompt", "romantic floral arch with warm sunset tones");

  const request = new NextRequest("http://localhost/api/generate", {
    method: "POST",
    body: formData,
  });

  const response = await POST(request);
  const initial = await response.json();
  console.log("Initial API response:", initial);

  await new Promise((resolve) => setTimeout(resolve, 4000));

  console.log("Generated records:", generatedRecords);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
