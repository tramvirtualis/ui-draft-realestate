import ImageTile from "./ImageTile";
import type { ProjectImage } from "../../../../types/project/projectImage.types";

type Props = {
  images: ProjectImage[];
  labelOf: (image: ProjectImage) => string;
  dateOf: (image: ProjectImage) => string;
  onView: (index: number) => void;
  onDelete: (image: ProjectImage) => void;
};

// Masonry bằng CSS columns: ảnh giữ đúng tỷ lệ gốc, xếp thành các cột so le
export default function ImageGallery({ images, labelOf, dateOf, onView, onDelete }: Props) {
  return (
    <div className="columns-1 gap-4 sm:columns-2 xl:columns-3 2xl:columns-4">
      {images.map((img, i) => (
        <ImageTile key={img.id} image={img} label={labelOf(img)} date={dateOf(img)} index={i} onView={() => onView(i)} onDelete={() => onDelete(img)} />
      ))}
    </div>
  );
}
