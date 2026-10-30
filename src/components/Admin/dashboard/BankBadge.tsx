import { BANKS } from "../../../data/mockInterestRates";

type Props = { bank: string; size?: "sm" | "md" };

// Ô vuông bo góc mang màu và mã của ngân hàng
export default function BankBadge({ bank, size = "md" }: Props) {
  const b = BANKS[bank];
  const dim = size === "sm" ? "h-7 w-7 text-[8px]" : "h-10 w-10 text-[10px]";
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-lg font-bold text-white ${dim}`}
      style={{ backgroundColor: b?.color ?? "#64748b" }}
      aria-hidden
    >
      {b?.code ?? "?"}
    </span>
  );
}
