"use client";

import { useEffect } from "react";

export default function IncrementProfileView({ userId }) {
  useEffect(() => {
    if (!userId) return;

    fetch(`/api/users/${userId}/views`, { method: "POST" });
  }, [userId]);

  return null;
}
