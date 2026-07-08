export function SectionHeading({ eyebrow, title, description, centered = true }) {
  return (
    <div className={centered ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      {eyebrow ? (
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.35em] text-primary/80">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-base leading-8 text-muted-foreground sm:text-lg">
          {description}
        </p>
      ) : null}
    </div>
  );
}
