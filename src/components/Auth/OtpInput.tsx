import { useRef, type ClipboardEvent, type KeyboardEvent } from "react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
};

// 6 ô nhập OTP: tự nhảy ô, Backspace lùi ô, dán cả mã vào ô nào cũng được
export default function OtpInput({ value, onChange, length = 6, disabled }: Props) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length }, (_, i) => value[i] ?? "");

  const focus = (i: number) => refs.current[Math.max(0, Math.min(length - 1, i))]?.focus();

  const setDigit = (i: number, d: string) => {
    const next = digits.slice();
    next[i] = d;
    onChange(next.join("").slice(0, length));
  };

  const handleChange = (i: number, raw: string) => {
    const d = raw.replace(/\D/g, "").slice(-1);
    setDigit(i, d);
    if (d) focus(i + 1);
  };

  const handleKeyDown = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i]) {
      e.preventDefault();
      setDigit(i - 1, "");
      focus(i - 1);
    } else if (e.key === "ArrowLeft") focus(i - 1);
    else if (e.key === "ArrowRight") focus(i + 1);
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;
    e.preventDefault();
    onChange(pasted);
    focus(pasted.length);
  };

  return (
    <div className="flex justify-between gap-2">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          value={d}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={1}
          disabled={disabled}
          aria-label={`Số thứ ${i + 1} của mã OTP`}
          className="h-12 w-full max-w-12 rounded-xl border border-gray-200 bg-white text-center text-lg font-semibold text-heading outline-none focus:border-primary-300 focus:ring-4 focus:ring-primary-100 disabled:opacity-60"
        />
      ))}
    </div>
  );
}
