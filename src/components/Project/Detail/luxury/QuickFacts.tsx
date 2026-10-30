import { Building2, Compass, Landmark, Layers, ShieldCheck, UserRound, Wallet, type LucideIcon } from "lucide-react";
import Container from "../Container";
import Reveal from "../../../common/Reveal";
import type { ProjectProfile } from "../../../../types/project/projectOverview.types";

type Fact = { icon: LucideIcon; label: string; value: string };

// Chỉ hiển thị các trường dự án thực sự có dữ liệu
const buildFacts = (p: ProjectProfile): Fact[] =>
  [
    { icon: UserRound, label: "Chủ đầu tư", value: p.investor },
    { icon: Compass, label: "Vị trí", value: p.location },
    { icon: Layers, label: "Quy mô", value: p.size },
    { icon: Wallet, label: "Tổng vốn đầu tư", value: p.totalInvestment },
    { icon: Building2, label: "Loại hình phát triển", value: [p.buildingType, ...p.types].filter(Boolean).join(" · ") },
    { icon: ShieldCheck, label: "Pháp lý / Sở hữu", value: p.ownershipType },
    { icon: Landmark, label: "Đơn vị tư vấn", value: p.consultancy },
  ].filter((f) => f.value);

export default function QuickFacts({ profile }: { profile: ProjectProfile }) {
  const facts = buildFacts(profile);
  if (facts.length === 0) return null;

  return (
    <section aria-label="Thông tin nhanh" className="relative z-10 -mt-20 md:-mt-24">
      <Container>
        {/* Tấm kính trắng nổi chồng lên chân hero */}
        <ul className="grid grid-cols-1 gap-2 rounded-[2rem] border border-white/80 bg-white/80 p-3 shadow-[0_30px_60px_-30px_rgba(10,15,26,0.45)] backdrop-blur-xl sm:grid-cols-2 lg:grid-cols-4">
          {facts.map(({ icon: Icon, label, value }, i) => (
            <li key={label}>
              <Reveal variant="up" delay={i * 70} className="h-full">
                <div className="group flex h-full items-start gap-4 rounded-2xl p-4 transition duration-300 hover:bg-primary-50">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-primary-700">
                    <Icon size={20} aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="font-heading text-[10px] font-bold uppercase tracking-[0.18em] text-muted">{label}</p>
                    <p className="mt-1 break-words font-semibold leading-snug text-heading">{value}</p>
                  </div>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
