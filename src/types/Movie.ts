// src/types/Movie.ts
export type Movie = {
  id: number;
  title: string;
  year?: number | null;
  watched: number; // 0 hoặc 1
  rating?: number | null; // 1-5
  created_at: number;
};