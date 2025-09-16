export interface User {
  id: string;
  name?: string | null;
  email: string;
  image?: string | null;
  credits: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface GeneratedImage {
  id: string;
  userId: string;
  originalUrl: string;
  generatedUrl?: string | null;
  prompt: string;
  style: string;
  status: "PROCESSING" | "COMPLETED" | "FAILED";
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  userId: string;
  amount: number;
  credits: number;
  status: "PENDING" | "COMPLETED" | "FAILED";
  createdAt: Date;
  updatedAt: Date;
}

export interface WeddingStyle {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  prompt: string;
}

export interface UploadFormData {
  image: File;
  style: string;
  prompt?: string;
}

export interface GenerateImageRequest {
  imageUrl: string;
  style: string;
  prompt?: string;
}

export interface GenerateImageResponse {
  success: boolean;
  imageId?: string;
  generatedUrl?: string;
  error?: string;
}
