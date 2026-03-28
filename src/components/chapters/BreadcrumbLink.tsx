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
      className="transition-colors"
      style={{ color: "var(--text-muted)" }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.color =
          "var(--text-secondary)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.color =
          "var(--text-muted)";
      }}
    >
      {children}
    </Link>
  );
}
