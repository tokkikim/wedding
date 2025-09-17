"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "./ui/Button";
import { validateImageFile } from "@/lib/utils";
import { useImageStore } from "@/store/useImageStore";

interface ImageUploadProps {
  onUpload?: (file: File) => void;
}

export function ImageUpload({ onUpload }: ImageUploadProps) {
  const [error, setError] = useState<string>("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { currentImage, setCurrentImage } = useImageStore();

  useEffect(() => {
    if (!currentImage) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(currentImage);
    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [currentImage]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      const validation = validateImageFile(file);
      if (!validation.valid) {
        setError(validation.error || "유효하지 않은 파일입니다.");
        return;
      }

      setError("");
      setCurrentImage(file);
      onUpload?.(file);
    },
    [setCurrentImage, onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const removeImage = () => {
    setCurrentImage(null);
    setError("");
  };

  if (currentImage && previewUrl) {
    return (
      <div className="relative">
        <div className="relative overflow-hidden rounded-lg border-2 border-gray-200">
          <div className="relative h-64 w-full">
            <Image
              src={previewUrl}
              alt="업로드된 이미지"
              fill
              className="object-cover"
              sizes="(min-width: 768px) 512px, 100vw"
              unoptimized
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-2 h-8 w-8 rounded-full bg-black/50 p-0 text-white hover:bg-black/70"
            onClick={removeImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="mt-2 text-sm text-gray-600">
          {currentImage.name} ({(currentImage.size / 1024 / 1024).toFixed(2)}{" "}
          MB)
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`
          relative cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors
          ${
            isDragActive
              ? "border-rose-500 bg-rose-50"
              : "border-gray-300 hover:border-rose-400 hover:bg-gray-50"
          }
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-4">
          {isDragActive ? (
            <Upload className="h-12 w-12 text-rose-500" />
          ) : (
            <ImageIcon className="h-12 w-12 text-gray-400" />
          )}

          <div className="space-y-2">
            <p className="text-lg font-medium text-gray-900">
              {isDragActive
                ? "이미지를 여기에 놓으세요"
                : "이미지를 업로드하세요"}
            </p>
            <p className="text-sm text-gray-600">
              드래그 앤 드롭하거나 클릭하여 파일을 선택하세요
            </p>
            <p className="text-xs text-gray-500">
              JPEG, PNG, WebP 형식 (최대 10MB)
            </p>
          </div>
        </div>
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
