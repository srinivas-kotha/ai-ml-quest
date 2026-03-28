"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import ThemeToggle from "./ThemeToggle";

export default function TopNav() {
  const { data: session, status } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <nav
      className="sticky top-0 z-50 w-full"
      style={{
        backgroundColor: "var(--color-bg-overlay)",
        backdropFilter: "blur(16px) saturate(180%)",
        WebkitBackdropFilter: "blur(16px) saturate(180%)",
        borderBottom: "1px solid var(--color-border)",
        height: "60px",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 transition-opacity duration-150"
            style={{ textDecoration: "none" }}
          >
            <span
              className="font-display font-extrabold tracking-tight text-gradient"
              style={{
                fontSize: "1.05rem",
              }}
            >
              AI/ML Quest
            </span>
          </Link>

          {/* Right controls */}
          <div className="flex items-center gap-3">
            {/* Theme toggle */}
            <ThemeToggle />

            {/* Auth controls */}
            {status === "loading" ? (
              <div
                className="h-8 w-20 rounded-md animate-pulse"
                style={{ backgroundColor: "var(--color-bg-surface)" }}
              />
            ) : session ? (
              /* Signed-in state */
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors"
                  style={{
                    color: "var(--color-text-secondary)",
                    border: "1px solid var(--color-border)",
                    backgroundColor: "transparent",
                  }}
                  onMouseEnter={(e) => {
                    (
                      e.currentTarget as HTMLButtonElement
                    ).style.backgroundColor = "var(--color-bg-surface)";
                    (e.currentTarget as HTMLButtonElement).style.borderColor =
                      "var(--border-hover)";
                  }}
                  onMouseLeave={(e) => {
                    (
                      e.currentTarget as HTMLButtonElement
                    ).style.backgroundColor = "transparent";
                    (e.currentTarget as HTMLButtonElement).style.borderColor =
                      "var(--color-border)";
                  }}
                  aria-haspopup="true"
                  aria-expanded={dropdownOpen}
                >
                  {session.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name ?? "User avatar"}
                      width={22}
                      height={22}
                      className="rounded-full"
                    />
                  ) : (
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold"
                      style={{
                        backgroundColor: "var(--chapter-rag)",
                        color: "#fff",
                      }}
                    >
                      {(session.user?.name ?? "?")[0].toUpperCase()}
                    </span>
                  )}
                  <span className="hidden sm:inline max-w-[120px] truncate">
                    {session.user?.name ?? session.user?.email}
                  </span>
                  <svg
                    className="w-3 h-3 opacity-60"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {dropdownOpen && (
                  <>
                    {/* Backdrop */}
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setDropdownOpen(false)}
                    />
                    {/* Dropdown menu */}
                    <div
                      className="absolute right-0 mt-1 w-48 rounded-xl py-1 z-20 shadow-xl"
                      style={{
                        backgroundColor: "var(--color-bg-card)",
                        border: "1px solid var(--color-border)",
                      }}
                    >
                      <div
                        className="px-3 py-2 border-b"
                        style={{ borderColor: "var(--color-border)" }}
                      >
                        <p
                          className="text-xs font-medium truncate"
                          style={{ color: "var(--color-text-primary)" }}
                        >
                          {session.user?.name}
                        </p>
                        {session.user?.email && (
                          <p
                            className="text-xs truncate"
                            style={{ color: "var(--color-text-muted)" }}
                          >
                            {session.user.email}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          signOut({ callbackUrl: "/" });
                        }}
                        className="w-full text-left px-3 py-2 text-xs transition-colors"
                        style={{ color: "var(--color-text-secondary)" }}
                        onMouseEnter={(e) => {
                          (
                            e.currentTarget as HTMLButtonElement
                          ).style.backgroundColor = "var(--color-bg-surface)";
                          (e.currentTarget as HTMLButtonElement).style.color =
                            "var(--color-text-primary)";
                        }}
                        onMouseLeave={(e) => {
                          (
                            e.currentTarget as HTMLButtonElement
                          ).style.backgroundColor = "transparent";
                          (e.currentTarget as HTMLButtonElement).style.color =
                            "var(--color-text-secondary)";
                        }}
                      >
                        Sign out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              /* Not signed in */
              <button
                onClick={() => signIn("github")}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-150"
                style={{
                  color: "var(--color-text-secondary)",
                  border: "1px solid var(--color-border)",
                  backgroundColor: "transparent",
                }}
                onMouseEnter={(e) => {
                  const btn = e.currentTarget as HTMLButtonElement;
                  btn.style.backgroundColor = "rgba(0, 201, 167, 0.08)";
                  btn.style.borderColor = "rgba(0, 201, 167, 0.35)";
                  btn.style.color = "var(--color-accent-teal)";
                }}
                onMouseLeave={(e) => {
                  const btn = e.currentTarget as HTMLButtonElement;
                  btn.style.backgroundColor = "transparent";
                  btn.style.borderColor = "var(--color-border)";
                  btn.style.color = "var(--color-text-secondary)";
                }}
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                </svg>
                Sign in
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
