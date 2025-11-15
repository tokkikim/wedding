import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ResultClient } from "./ResultClient";

interface ResultPageProps {
  params: Promise<{ id: string }>;
}

export default async function ResultPage({ params }: ResultPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    notFound();
  }

  const { id } = await params;
  const generatedImage = await prisma.generatedImage.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
  });

  if (!generatedImage) {
    notFound();
  }

  return <ResultClient generatedImage={generatedImage} />;
}
