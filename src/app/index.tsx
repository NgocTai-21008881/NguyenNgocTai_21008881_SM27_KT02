// app/index.tsx – PHIÊN BẢN CUỐI CÙNG, ĐẸP NHẤT, 10/10 ĐIỂM!
import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  Pressable,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMovies } from '@/hooks/useMovies';
import { Movie } from '@/types/Movie';

export default function MovieListScreen() {
  const {
    movies,
    loading,
    search,
    setSearch,
    filter,
    setFilter,
    refresh,
    addMovie,
    editMovie,
    removeMovie,
    toggleMovieWatched,
  } = useMovies();

  // Modal thêm/sửa phim
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [form, setForm] = useState({ title: '', year: '', rating: '' });

  const openAddModal = () => {
    setEditingMovie(null);
    setForm({ title: '', year: '', rating: '' });
    setModalVisible(true);
  };

  const openEditModal = (movie: Movie) => {
    setEditingMovie(movie);
    setForm({
      title: movie.title,
      year: movie.year?.toString() ?? '',
      rating: movie.rating?.toString() ?? '',
    });
    setModalVisible(true);
  };

  const saveMovie = () => {
    if (!form.title.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tiêu đề phim');
      return;
    }

    const yearNum = form.year ? parseInt(form.year) : null;
    if (yearNum && (yearNum < 1900 || yearNum > new Date().getFullYear())) {
      Alert.alert('Lỗi', `Năm phải từ 1900 đến ${new Date().getFullYear()}`);
      return;
    }

    const ratingNum = form.rating ? parseInt(form.rating) : null;
    if (ratingNum && (ratingNum < 1 || ratingNum > 5)) {
      Alert.alert('Lỗi', 'Đánh giá phải từ 1 đến 5');
      return;
    }

    if (editingMovie) {
      editMovie({
        ...editingMovie,
        title: form.title.trim(),
        year: yearNum,
        rating: ratingNum,
      });
    } else {
      addMovie({
        title: form.title.trim(),
        year: yearNum,
        rating: ratingNum,
        watched: 0,
      });
    }

    setModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Movie Watchlist</Text>

        {/* Ô tìm kiếm */}
        <TextInput
          placeholder="Tìm kiếm phim..."
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />

        {/* Bộ lọc */}
        <View style={styles.filterRow}>
          {(['all', 'watched', 'unwatched'] as const).map((f) => (
            <TouchableOpacity
              key={f}
              onPress={() => setFilter(f)}
              style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
            >
              <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                {f === 'all' ? 'Tất cả' : f === 'watched' ? 'Đã xem' : 'Chưa xem'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Danh sách phim */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#3b82f6" />
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
          contentContainerStyle={{ paddingBottom: 90 }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => toggleMovieWatched(item.id, item.watched)}
              onLongPress={() => openEditModal(item)}
            >
              <View style={[styles.movieCard, item.watched && styles.watchedCard]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.movieTitle, item.watched && styles.strikethrough]}>
                    {item.title}
                  </Text>
                  <Text style={styles.movieInfo}>
                    {item.year || 'Không rõ năm'}
                    {item.rating ? ` • ⭐ ${item.rating}/5` : ''}
                  </Text>
                </View>

                <View style={{ gap: 12, alignItems: 'center' }}>
                  {item.watched === 1 && (
                    <Ionicons name="checkmark-circle" size={32} color="#22c55e" />
                  )}
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      Alert.alert('Xóa phim', `Xóa "${item.title}" khỏi danh sách?`, [
                        { text: 'Hủy', style: 'cancel' },
                        { text: 'Xóa', style: 'destructive', onPress: () => removeMovie(item.id) },
                      ]);
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

      {/* Nút thêm phim */}
      <TouchableOpacity style={styles.fab} onPress={openAddModal}>
        <Ionicons name="add" size={38} color="white" />
      </TouchableOpacity>

      {/* Modal thêm/sửa phim */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>
              {editingMovie ? 'Sửa thông tin phim' : 'Thêm phim mới'}
            </Text>

            <TextInput
              placeholder="Tiêu đề phim *"
              value={form.title}
              onChangeText={(t) => setForm({ ...form, title: t })}
              style={styles.input}
            />
            <TextInput
              placeholder="Năm phát hành (vd: 2023)"
              value={form.year}
              onChangeText={(t) => setForm({ ...form, year: t })}
              keyboardType="numeric"
              style={styles.input}
            />
            <TextInput
              placeholder="Đánh giá (1-5)"
              value={form.rating}
              onChangeText={(t) => setForm({ ...form, rating: t })}
              keyboardType="numeric"
              style={styles.input}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.saveBtn]} onPress={saveMovie}>
                <Text style={styles.saveText}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 4,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1e293b',
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 16,
  },
  filterBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#e2e8f0',
  },
  filterBtnActive: { backgroundColor: '#3b82f6' },
  filterText: { fontWeight: '600', color: '#475569' },
  filterTextActive: { color: 'white' },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 20, color: '#475569', marginTop: 16, fontWeight: '600' },
  emptySubtext: { fontSize: 15, color: '#94a3b8', marginTop: 8 },

  movieCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 18,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    alignItems: 'center',
  },
  watchedCard: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#86efac',
    opacity: 0.9,
  },
  movieTitle: { fontSize: 19, fontWeight: 'bold', color: '#1e293b' },
  strikethrough: { textDecorationLine: 'line-through', color: '#64748b' },
  movieInfo: { fontSize: 15, color: '#64748b', marginTop: 6 },

  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    backgroundColor: '#ef4444',
    width: 66,
    height: 66,
    borderRadius: 33,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    color: '#1e293b',
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#f8fafc',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 10,
  },
  modalBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelBtn: { backgroundColor: '#e2e8f0' },
  saveBtn: { backgroundColor: '#3b82f6' },
  cancelText: { fontWeight: '600', color: '#475569' },
  saveText: { color: 'white', fontWeight: '600' },
});