interface SectionHeadingProps {
  id: string;
  title: string;
  description?: string;
}

export function SectionHeading({ id, title, description }: SectionHeadingProps) {
  return (
    <div id={id} className="scroll-mt-6">
      <h2 className="text-xl font-bold text-neutral-900">{title}</h2>
      {description && <p className="mt-1 text-sm text-neutral-500">{description}</p>}
      <div className="mt-3 h-px bg-neutral-200" />
    </div>
  );
}
