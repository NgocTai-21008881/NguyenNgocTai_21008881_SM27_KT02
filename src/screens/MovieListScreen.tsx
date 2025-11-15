// src/screens/MovieListScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  StyleSheet,
  Pressable,
} from "react-native";
import { useMovies } from "@/hooks/useMovies";
import MovieModal from "@/components/MovieModal";
import { Movie } from "@/types/Movie";
import { Ionicons } from "@expo/vector-icons";

export default function MovieListScreen() {
  const {
    movies,
    loading,
    refresh,
    search,
    setSearch,
    filter,
    setFilter,
    addMovie,
    editMovie,
    removeMovie,
    toggleMovieWatched,
  } = useMovies();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);

  const openAddModal = () => {
    setEditingMovie(null);
    setModalVisible(true);
  };

  const openEditModal = (movie: Movie) => {
    setEditingMovie(movie);
    setModalVisible(true);
  };

  const handleSave = (data: any) => {
    if ("id" in data) {
      editMovie(data as Movie);
    } else {
      addMovie(data);
    }
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Movie Watchlist</Text>

        {/* Search */}
        <TextInput
          placeholder="Tìm kiếm phim..."
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />

        {/* Filter */}
        <View style={styles.filterContainer}>
          {(["all", "watched", "unwatched"] as const).map((f) => (
            <TouchableOpacity
              key={f}
              onPress={() => setFilter(f)}
              style={[styles.filterButton, filter === f && styles.filterButtonActive]}
            >
              <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                {f === "all" ? "Tất cả" : f === "watched" ? "Đã xem" : "Chưa xem"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Loading & Empty State */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : movies.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="film-outline" size={80} color="#94a3b8" />
          <Text style={styles.emptyText}>Chưa có phim nào trong danh sách.</Text>
          <Text style={styles.emptySubtext}>Nhấn nút + để thêm phim mới</Text>
        </View>
      ) : (
        <FlatList
          data={movies}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
          contentContainerStyle={{ paddingBottom: 80 }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => toggleMovieWatched(item.id, item.watched)}
              onLongPress={() => openEditModal(item)}
            >
              <View style={[styles.movieItem, item.watched && styles.watchedItem]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.movieTitle, item.watched && styles.strikethrough]}>
                    {item.title}
                  </Text>
                  <Text style={styles.movieInfo}>
                    {item.year ? `${item.year}` : "Không rõ năm"}
                    {item.rating ? ` • ⭐ ${item.rating}` : ""}
                  </Text>
                </View>

                <View style={{ alignItems: "center", gap: 12 }}>
                  {item.watched === 1 && (
                    <Ionicons name="checkmark-circle" size={32} color="#22c55e" />
                  )}
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      Alert.alert(
                        "Xóa phim",
                        `Bạn có chắc chắn muốn xóa "${item.title}"?`,
                        [
                          { text: "Hủy", style: "cancel" },
                          {
                            text: "Xóa",
                            style: "destructive",
                            onPress: () => removeMovie(item.id),
                          },
                        ]
                      );
                    }}
                  >
                    <Ionicons name="trash-outline" size={26} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
            </Pressable>
          )}
        />
      )}

      {/* Nút Thêm Phim */}
      <TouchableOpacity style={styles.fab} onPress={openAddModal}>
        <Ionicons name="add" size={36} color="white" />
      </TouchableOpacity>

      {/* Modal Thêm/Sửa */}
      <MovieModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        movie={editingMovie}
        onSave={handleSave}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: {
    backgroundColor: "white",
    padding: 16,
    borderBottomWidth: 1,
    borderColor: "#e2e8f0",
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    color: "#1e293b",
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginTop: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#e2e8f0",
  },
  filterButtonActive: {
    backgroundColor: "#3b82f6",
  },
  filterText: {
    fontWeight: "600",
    color: "#475569",
  },
  filterTextActive: {
    color: "white",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 20,
    color: "#475569",
    marginTop: 16,
    fontWeight: "600",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#94a3b8",
    marginTop: 8,
  },
  movieItem: {
    flexDirection: "row",
    backgroundColor: "white",
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 16,
    borderRadius: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignItems: "center",
  },
  watchedItem: {
    opacity: 0.7,
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#86efac",
  },
  movieTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
  },
  strikethrough: {
    textDecorationLine: "line-through",
    color: "#64748b",
  },
  movieInfo: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 4,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 30,
    backgroundColor: "#ef4444",
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});