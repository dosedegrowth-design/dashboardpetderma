import Image from "next/image";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Image
      src="/brand/petderma-logo.png"
      alt="Petderma — Dermatologia Veterinária"
      width={300}
      height={166}
      priority
      className={compact ? "h-8 w-auto" : "h-12 w-auto"}
    />
  );
}
