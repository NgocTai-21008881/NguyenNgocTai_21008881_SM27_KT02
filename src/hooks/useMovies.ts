// src/hooks/useMovies.ts
import { useState, useEffect, useCallback } from "react";
import * as SQLite from "expo-sqlite";
import { Movie } from "@/types/Movie";
import {
  initMovieTable,
  getAllMovies,
  insertMovie,
  updateMovie,
  toggleWatched,
  deleteMovie,
} from "@/db/movie";

const db = SQLite.openDatabaseAsync("movieWatchlist.db");

export const useMovies = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [filter, setFilter] = useState<"all" | "watched" | "unwatched">("all");

  const loadMovies = useCallback(async () => {
    try {
      setLoading(true);
      const database = await db;
      await initMovieTable(database);
      const data = await getAllMovies(database);
      setMovies(data);
    } catch (error) {
      console.error("Lỗi load phim:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMovies();
  }, [loadMovies]);

  const addMovie = async (movie: Omit<Movie, "id" | "created_at">) => {
    const database = await db;
    await insertMovie(database, movie);
    await loadMovies();
  };

  const editMovie = async (movie: Movie) => {
    const database = await db;
    await updateMovie(database, movie);
    await loadMovies();
  };

  const removeMovie = async (id: number) => {
    const database = await db;
    await deleteMovie(database, id);
    await loadMovies();
  };

  const toggleMovieWatched = async (id: number, current: number) => {
    const database = await db;
    await toggleWatched(database, id, current);
    await loadMovies();
  };

  // Lọc + Tìm kiếm real-time (Câu 8 – dùng useMemo để tối ưu)
  const filteredMovies = movies
    .filter((m) =>
      search
        ? m.title.toLowerCase().includes(search.toLowerCase())
        : true
    )
    .filter((m) => {
      if (filter === "watched") return m.watched === 1;
      if (filter === "unwatched") return m.watched === 0;
      return true;
    });

  return {
    movies: filteredMovies,
    loading,
    search,
    setSearch,
    filter,
    setFilter,
    refresh: loadMovies,

    // Các hàm xử lý
    addMovie,
    editMovie,
    removeMovie,
    toggleMovieWatched,
  };
};