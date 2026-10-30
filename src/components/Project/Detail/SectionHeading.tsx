import type { ReactNode } from "react";

type Props = { id?: string; eyebrow: string; title: string; desc?: string; action?: ReactNode };

export default function SectionHeading({ id, eyebrow, title, desc, action }: Props) {
  return (
    <div id={id} className="mb-8 flex scroll-mt-36 flex-wrap items-end justify-between gap-4">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary-600">{eyebrow}</p>
        <h2 className="mt-2 text-3xl font-semibold leading-tight text-heading">{title}</h2>
        {desc && <p className="mt-3 text-base text-body">{desc}</p>}
      </div>
      {action}
    </div>
  );
}
