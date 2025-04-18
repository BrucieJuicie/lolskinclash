"use client";

import { Suspense } from "react";
import DraftPageInner from "@/components/DraftPageInner";

export default function DraftPage() {
  return (
    <Suspense fallback={<div className="text-center text-lightPurple">Loading draft...</div>}>
      <DraftPageInner />
    </Suspense>
  );
}
