// src/components/MovieModal.tsx
import { useState, useEffect } from "react";
import { Modal, View, TextInput, Button, Alert, Text, StyleSheet } from "react-native";
import { Movie } from "@/types/Movie";

type Props = {
  visible: boolean;
  onClose: () => void;
  movie?: Movie | null;
  onSave: (movie: Omit<Movie, "id" | "created_at"> | Movie) => void;
};

export default function MovieModal({ visible, onClose, movie, onSave }: Props) {
  const [title, setTitle] = useState("");
  const [year, setYear] = useState("");
  const [rating, setRating] = useState("");

  useEffect(() => {
    if (movie) {
      setTitle(movie.title);
      setYear(movie.year?.toString() ?? "");
      setRating(movie.rating?.toString() ?? "");
    } else {
      setTitle("");
      setYear("");
      setRating("");
    }
  }, [movie, visible]);

  const handleSave = () => {
    if (!title.trim()) return Alert.alert("Lỗi", "Tiêu đề không được để trống");

    const yearNum = year ? parseInt(year) : null;
    if (yearNum && (yearNum < 1900 || yearNum > new Date().getFullYear())) {
      return Alert.alert("Lỗi", `Năm phải từ 1900 đến ${new Date().getFullYear()}`);
    }

    const ratingNum = rating ? parseInt(rating) : null;
    if (ratingNum && (ratingNum < 1 || ratingNum > 5)) {
      return Alert.alert("Lỗi", "Đánh giá từ 1-5");
    }

    onSave({
      ...(movie ?? {}),
      title: title.trim(),
      year: yearNum,
      rating: ratingNum,
      watched: movie?.watched ?? 0,
    } as any);

    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>{movie ? "Sửa phim" : "Thêm phim mới"}</Text>
          <TextInput placeholder="Tiêu đề *" style={styles.input} value={title} onChangeText={setTitle} />
          <TextInput placeholder="Năm (vd: 2023)" style={styles.input} value={year} onChangeText={setYear} keyboardType="numeric" />
          <TextInput placeholder="Đánh giá (1-5)" style={styles.input} value={rating} onChangeText={setRating} keyboardType="numeric" />
          <View style={{ flexDirection: "row", gap: 10, marginTop: 20 }}>
            <Button title="Hủy" onPress={onClose} color="gray" />
            <Button title="Lưu" onPress={handleSave} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 20 },
  modal: { backgroundColor: "white", padding: 20, borderRadius: 12, elevation: 5 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 15 },
  input: { borderWidth: 1, borderColor: "#ddd", padding: 12, borderRadius: 8, marginBottom: 12 },
});