"use client";

import { create } from "zustand";
import type { GeneratedImage, WeddingStyle } from "@/types";

interface ImageState {
  currentImage: File | null;
  generatedImages: GeneratedImage[];
  selectedStyle: WeddingStyle | null;
  isGenerating: boolean;
  setCurrentImage: (image: File | null) => void;
  setGeneratedImages: (images: GeneratedImage[]) => void;
  addGeneratedImage: (image: GeneratedImage) => void;
  setSelectedStyle: (style: WeddingStyle | null) => void;
  setGenerating: (generating: boolean) => void;
}

export const useImageStore = create<ImageState>((set) => ({
  currentImage: null,
  generatedImages: [],
  selectedStyle: null,
  isGenerating: false,
  setCurrentImage: (currentImage) => set({ currentImage }),
  setGeneratedImages: (generatedImages) => set({ generatedImages }),
  addGeneratedImage: (image) =>
    set((state) => ({
      generatedImages: [image, ...state.generatedImages],
    })),
  setSelectedStyle: (selectedStyle) => set({ selectedStyle }),
  setGenerating: (isGenerating) => set({ isGenerating }),
}));
