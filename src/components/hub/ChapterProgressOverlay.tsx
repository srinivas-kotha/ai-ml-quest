"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import ProgressBar from "@/components/ui/ProgressBar";
import { getGuestChapterCompletedIds } from "@/lib/guest-progress";
import { ProgressRing } from "./ChapterCard";

interface ChapterProgressOverlayProps {
  chapterId: number;
  totalLevels: number;
  accentColor: string;
  /** "bar" renders the original linear bar; "ring" renders the circular SVG ring */
  renderAs?: "bar" | "ring";
}

export default function ChapterProgressOverlay({
  chapterId,
  totalLevels,
  accentColor,
  renderAs = "bar",
}: ChapterProgressOverlayProps) {
  const { data: session } = useSession();
  const [completed, setCompleted] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    if (!session) {
      // Guest mode: read from localStorage using the canonical key format
      const completedIds = getGuestChapterCompletedIds(chapterId);
      setCompleted(completedIds.length);
    }
    // For authenticated users, progress is passed from server via API
    // (kept simple for Phase 1A — real progress fetching in 1B)
  }, [session, chapterId]);

  if (!mounted || (completed === 0 && !session)) return null;

  const pct = totalLevels > 0 ? completed / totalLevels : 0;
  const pctRounded = Math.round(pct * 100);

  if (renderAs === "ring") {
    return <ProgressRing pct={pct} accentColor={accentColor} />;
  }

  // Default: linear bar (legacy)
  return (
    <div className="mt-3">
      <ProgressBar value={pctRounded} accentColor={accentColor} height={3} />
      <p className="mt-1 text-xs" style={{ color: "var(--color-text-muted)" }}>
        {completed}/{totalLevels} levels
      </p>
    </div>
  );
}
