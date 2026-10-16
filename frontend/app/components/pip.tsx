import Image from "next/image";

export type PipPose = "wave" | "think" | "cheer" | "empty" | "sleepy" | "invite";

/**
 * Pip, the TableUs mascot: a plush moon that orbits the group's planet and carries the picks.
 * Decorative, so it has no alt text; the words next to it carry the meaning.
 */
export function Pip({ pose, size = 120, float = false, eager = false, className = "" }: {
  pose: PipPose;
  size?: number;
  /** Load right away when Pip sits at the top of the page, so it doesn't pop in. */
  eager?: boolean;
  /** Bob gently while something is happening, like finding picks. */
  float?: boolean;
  className?: string;
}) {
  return (
    <Image
      src={`/art/pip-${pose}.webp`}
      alt=""
      width={size}
      height={size}
      draggable={false}
      loading={eager ? "eager" : "lazy"}
      className={`pointer-events-none shrink-0 select-none ${float ? "pip-float" : ""} ${className}`}
    />
  );
}

/** A small plush spot illustration for a step or moment. Decorative. */
export function SpotIcon({ name, size = 56, className = "" }: {
  name: "distance" | "wishes" | "vote";
  size?: number;
  className?: string;
}) {
  return <Image src={`/art/spot-${name}.webp`} alt="" width={size} height={size} className={`pointer-events-none select-none ${className}`} />;
}
