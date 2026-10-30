export default function KnowledgeHeading({ eyebrow, title, desc }: { eyebrow: string; title: string; desc?: string }) {
  return (
    <div className="max-w-3xl">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-primary-600">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-semibold leading-tight text-heading md:text-4xl">{title}</h2>
      {desc && <p className="mt-2 text-sm text-body">{desc}</p>}
    </div>
  );
}
