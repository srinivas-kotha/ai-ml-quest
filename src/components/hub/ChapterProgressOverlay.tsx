"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import ProgressBar from "@/components/ui/ProgressBar";
import { getGuestChapterCompletedIds } from "@/lib/guest-progress";

interface ChapterProgressOverlayProps {
  chapterId: number;
  totalLevels: number;
  accentColor: string;
}

export default function ChapterProgressOverlay({
  chapterId,
  totalLevels,
  accentColor,
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

  const pct = totalLevels > 0 ? Math.round((completed / totalLevels) * 100) : 0;

  return (
    <div className="mt-3">
      <ProgressBar value={pct} accentColor={accentColor} height={3} />
      <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
        {completed}/{totalLevels} levels
      </p>
    </div>
  );
}
