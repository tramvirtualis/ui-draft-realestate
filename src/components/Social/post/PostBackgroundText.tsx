import { backgroundBoxClass, backgroundTextSize } from "./postBackground";
import type { PostBackground } from "../../../types/social/social.types";

type Props = {
  background: PostBackground;
  content: string;
};

// Bài chỉ có chữ kèm màu nền: chữ to, đậm, nằm giữa khung màu
export default function PostBackgroundText({ background, content }: Props) {
  return (
    <div className={`mb-3 ${backgroundBoxClass}`} style={{ background: background.value, color: background.textColor }}>
      <p className={`whitespace-pre-line break-words text-center font-bold ${backgroundTextSize(content.length)}`}>
        {content}
      </p>
    </div>
  );
}
