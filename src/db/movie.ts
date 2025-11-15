// src/db/movie.db.ts
import { SQLiteDatabase } from "expo-sqlite";
import { Movie } from "@/types/Movie";

export const initMovieTable = async (db: SQLiteDatabase) => {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS movies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      year INTEGER,
      watched INTEGER DEFAULT 0,
      rating INTEGER CHECK(rating >= 1 AND rating <= 5),
      created_at INTEGER NOT NULL
    );
  `);

  // Seed mẫu nếu chưa có
  const count = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM movies"
  );

  if (!count || count.count === 0) {
    await db.runAsync(
      `INSERT INTO movies (title, year, watched, rating, created_at) VALUES (?, ?, ?, ?, ?)`,
      ["Inception", 2010, 1, 5, Date.now()]
    );
    await db.runAsync(
      `INSERT INTO movies (title, year, watched, rating, created_at) VALUES (?, ?, ?, ?, ?)`,
      ["Interstellar", 2014, 0, null, Date.now()]
    );
    await db.runAsync(
      `INSERT INTO movies (title, year, watched, rating, created_at) VALUES (?, ?, ?, ?, ?)`,
      ["The Matrix", 1999, 1, 4, Date.now()]
    );
  }
};

// CREATE
export const insertMovie = async (db: SQLiteDatabase, movie: Omit<Movie, "id" | "created_at">) => {
  await db.runAsync(
    `INSERT INTO movies (title, year, watched, rating, created_at) VALUES (?, ?, ?, ?, ?)`,
    [movie.title, movie.year ?? null, movie.watched, movie.rating ?? null, Date.now()]
  );
};

// READ
export const getAllMovies = async (db: SQLiteDatabase): Promise<Movie[]> => {
  return await db.getAllAsync<Movie>(`SELECT * FROM movies ORDER BY created_at DESC`);
};

// UPDATE
export const updateMovie = async (db: SQLiteDatabase, movie: Movie) => {
  await db.runAsync(
    `UPDATE movies SET title = ?, year = ?, watched = ?, rating = ? WHERE id = ?`,
    [movie.title, movie.year ?? null, movie.watched, movie.rating ?? null, movie.id]
  );
};

export const toggleWatched = async (db: SQLiteDatabase, id: number, current: number) => {
  await db.runAsync(`UPDATE movies SET watched = ? WHERE id = ?`, [current ? 0 : 1, id]);
};

// DELETE
export const deleteMovie = async (db: SQLiteDatabase, id: number) => {
  await db.runAsync(`DELETE FROM movies WHERE id = ?`, [id]);
};

// CHECK DUPLICATE khi import
export const isMovieExists = async (db: SQLiteDatabase, title: string, year: number) => {
  const result = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM movies WHERE title = ? AND year = ?`,
    [title, year]
  );
  return (result?.count ?? 0) > 0;
};