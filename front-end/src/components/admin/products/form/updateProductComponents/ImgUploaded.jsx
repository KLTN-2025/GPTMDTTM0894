import { useCallback } from "react";
import { nanoid } from 'nanoid';

export default function ImgUploaded({ images, setImages }) {

  const handleUpload = useCallback((e) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      return;
    }

    const newImages = [];
    let loadedCount = 0;

    // Kiểm tra đã có ảnh ghim chưa (isMain === true)
    const hasMain = images.some(img => img.isMain === true);

    Array.from(files).forEach((file, idx) => {
      const reader = new FileReader();
      reader.onload = () => {
        newImages.push({
          id: nanoid(),
          file,
          url: reader.result,
          // Nếu chưa có ảnh ghim, ảnh đầu tiên được ghim (true), còn lại false
          isMain: hasMain ? false : (idx === 0),
          fromServer: false,
        });

        loadedCount++;
        if (loadedCount === files.length) {
          setImages([...images, ...newImages]);
          e.target.value = null; // reset input
        }
      };
      reader.onerror = () => {
        console.error("Error reading file", file.name);
      };
      reader.readAsDataURL(file);
    });
  }, [images, setImages]);

  const handleRemove = (id) => {
    const filtered = images.filter(img => img.id !== id);
    // Nếu ảnh ghim bị xóa, tự động ghim ảnh đầu tiên còn lại (nếu có)
    if (!filtered.some(img => img.isMain === true) && filtered.length > 0) {
      filtered[0].isMain = true;
    }
    setImages(filtered);
  };

  const handleSetMain = (id) => {
    const updated = images.map(img => ({
      ...img,
      isMain: img.id === id,
    }));
    setImages(updated);
  };

  return (
    <div>
      <label className="form-label fw-bold">Ảnh chung</label>
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleUpload}
        className="form-control mb-3"
      />

      <div className="d-flex flex-wrap gap-2">
        {images.map(img => (
          <div
            key={img.id}
            style={{
              position: "relative",
              width: 120,
              height: 120,
              border: img.isMain ? "3px solid #007bff" : "1px solid #ccc",
              borderRadius: 8,
              overflow: "hidden",
              cursor: "pointer",
            }}
            title={img.isMain ? "Ảnh đại diện" : "Chọn làm ảnh đại diện"}
            onClick={() => handleSetMain(img.id)}
          >
            <img
              src={img.url || img.previewUrl}
              alt="Ảnh sản phẩm"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              draggable={false}
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation(); // tránh kích hoạt setMain khi bấm xóa
                handleRemove(img.id);
              }}
              style={{
                position: "absolute",
                top: 4,
                right: 4,
                backgroundColor: "rgba(0,0,0,0.5)",
                border: "none",
                borderRadius: "50%",
                color: "white",
                width: 24,
                height: 24,
                cursor: "pointer",
                lineHeight: 1,
                fontSize: 18,
              }}
              title="Xóa ảnh"
            >
              &times;
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
