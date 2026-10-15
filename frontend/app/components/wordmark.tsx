import Link from "next/link";

/** The mark is a table seen from above: four seats around one plate. */
export function Wordmark({ href = "/", inverse = false }: { href?: string; inverse?: boolean }) {
  const ink = inverse ? "var(--color-leaf)" : "var(--color-bottle)";
  return (
    <Link href={href} className="inline-flex items-center gap-2" aria-label="TableUs home">
      <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
        <circle cx="14" cy="14" r="7" fill="var(--color-butter)" stroke={ink} strokeWidth="2" />
        {[[14, 2.5], [25.5, 14], [14, 25.5], [2.5, 14]].map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="2.5" fill={ink} />
        ))}
      </svg>
      <span className="display text-[1.75rem]" style={{ color: ink }}>TableUs</span>
    </Link>
  );
}
