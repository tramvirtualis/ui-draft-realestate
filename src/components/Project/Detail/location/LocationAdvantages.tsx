import Reveal from "../../../common/Reveal";
import LuxuryHeading from "../luxury/LuxuryHeading";

type Props = {
  name: string;
  advantages: string[];
};

// Ý dài thì thẻ rộng hơn; các thẻ tự giãn lấp đầy hàng nên số lượng nào cũng không để trống chỗ
const LONG_TEXT = 140;

// Điểm thuận lợi: các thẻ cùng một kiểu (nền trắng, số thứ tự tím), co giãn theo độ dài nội dung
export default function LocationAdvantages({ name, advantages }: Props) {
  if (advantages.length === 0) return null;

  return (
    <section id="diem-thuan-loi" aria-label="Điểm thuận lợi" className="scroll-mt-36 py-16 md:py-24">
      <div className="container mx-auto px-4 lg:px-8">
        <LuxuryHeading
          eyebrow="Điểm thuận lợi"
          title={`Vì sao vị trí ${name} đáng giá`}
          desc={`${advantages.length} lợi thế nổi bật về vị trí và kết nối của dự án.`}
        />

        <ol className="flex flex-wrap gap-4 md:gap-5">
          {advantages.map((text, i) => {
            const basis = text.length > LONG_TEXT ? "basis-[380px]" : "basis-[260px]";
            return (
              <li key={`${i}-${text}`} className={`min-w-0 max-w-full grow ${basis}`}>
                <Reveal delay={(i % 3) * 90} className="h-full">
                  <div className="group relative h-full overflow-hidden rounded-3xl border border-white/80 bg-white p-6 shadow-[0_24px_50px_-30px_rgba(10,15,26,0.35)] transition duration-300 hover:-translate-y-1 hover:border-primary-200 md:p-7">
                    <div className="relative flex items-center gap-3">
                      <span className="font-heading text-3xl font-semibold leading-none tabular-nums text-primary-500" aria-hidden>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="h-px flex-1 bg-primary-100 transition-colors group-hover:bg-primary-300" aria-hidden />
                    </div>
                    <p className="relative mt-5 wrap-break-word text-base leading-7 text-heading">
                      {text}
                    </p>
                  </div>
                </Reveal>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
