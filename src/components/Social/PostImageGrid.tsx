type Props = {
  images: string[];
  onImageClick?: (index: number) => void;
};

const MAX_TILES = 5;
const tile = "h-full w-full cursor-pointer object-cover";

// 1 ảnh: to hết cỡ | 2 ảnh: mỗi ảnh 1 nửa | 3 ảnh: 1 ảnh dài bên trái, 2 ảnh trên/dưới bên phải
// 4 ảnh: lưới 2x2 | 5 ảnh: 2 trên 3 dưới | >5 ảnh: giống 5 ảnh, ô cuối phủ "+N"
// Bấm vào ảnh bất kỳ -> gọi onImageClick (mở modal bài viết)
export default function PostImageGrid({ images, onImageClick }: Props) {
  const total = images.length;
  if (total === 0) return null;

  if (total === 1) {
    return (
      <img
        src={images[0]}
        alt=""
        onClick={() => onImageClick?.(0)}
        className="max-h-[28rem] w-full cursor-pointer rounded-lg object-cover"
      />
    );
  }

  if (total === 2) {
    return (
      <div className="grid h-72 grid-cols-2 gap-1 overflow-hidden rounded-lg">
        <img src={images[0]} alt="" onClick={() => onImageClick?.(0)} className={tile} />
        <img src={images[1]} alt="" onClick={() => onImageClick?.(1)} className={tile} />
      </div>
    );
  }

  if (total === 3) {
    return (
      <div className="grid h-96 grid-cols-2 grid-rows-2 gap-1 overflow-hidden rounded-lg">
        <img src={images[0]} alt="" onClick={() => onImageClick?.(0)} className={`row-span-2 ${tile}`} />
        <img src={images[1]} alt="" onClick={() => onImageClick?.(1)} className={tile} />
        <img src={images[2]} alt="" onClick={() => onImageClick?.(2)} className={tile} />
      </div>
    );
  }

  if (total === 4) {
    return (
      <div className="grid h-96 grid-cols-2 grid-rows-2 gap-1 overflow-hidden rounded-lg">
        {images.map((src, i) => (
          <img key={i} src={src} alt="" onClick={() => onImageClick?.(i)} className={tile} />
        ))}
      </div>
    );
  }

  // 5 ảnh trở lên: 2 ảnh hàng trên, 3 ảnh hàng dưới
  const shown = images.slice(0, MAX_TILES);
  const remaining = total > MAX_TILES ? total - (MAX_TILES - 1) : 0;

  return (
    <div className="grid h-[28rem] grid-cols-6 grid-rows-[3fr_2fr] gap-1 overflow-hidden rounded-lg">
      {shown.map((src, i) => (
        <div
          key={i}
          onClick={() => onImageClick?.(i)}
          className={`relative min-h-0 cursor-pointer ${i < 2 ? "col-span-3" : "col-span-2"}`}
        >
          <img src={src} alt="" className={tile} />
          {i === MAX_TILES - 1 && remaining > 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/55 text-3xl font-semibold text-white">
              +{remaining}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
