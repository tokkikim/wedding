import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { GalleryClient } from "./GalleryClient";

export default async function GalleryPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  // 사용자의 생성된 이미지들 가져오기
  const generatedImages = await prisma.generatedImage.findMany({
    where: {
      userId: session.user.id,
      status: "COMPLETED",
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 50, // 최대 50개
  });

  return <GalleryClient images={generatedImages} />;
}
