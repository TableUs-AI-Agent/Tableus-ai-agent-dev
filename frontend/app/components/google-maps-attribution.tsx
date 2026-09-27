import Image from "next/image";

export function GoogleMapsAttribution({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex px-[10px] pb-[5px] pt-[10px] ${className}`.trim()}>
      <Image
        src="/google-maps-attribution.svg"
        width={98}
        height={18}
        alt="Google Maps"
        className="h-[18px] w-[98px]"
      />
    </span>
  );
}
