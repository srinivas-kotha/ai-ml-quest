"use client";

import Link from "next/link";

interface BreadcrumbLinkProps {
  href: string;
  children: React.ReactNode;
}

export default function BreadcrumbLink({
  href,
  children,
}: BreadcrumbLinkProps) {
  return (
    <Link
      href={href}
      className="transition-colors duration-150"
      style={{ color: "var(--color-text-muted)" }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.color =
          "var(--color-accent-gold)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.color =
          "var(--color-text-muted)";
      }}
    >
      {children}
    </Link>
  );
}
