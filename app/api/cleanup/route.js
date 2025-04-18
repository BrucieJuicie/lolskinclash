import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

export async function GET() {
  const dataDir = path.join(process.cwd(), "app", "data");
  const files = fs.readdirSync(dataDir);
  let deleted = 0;

  const now = Date.now();
  const MAX_INACTIVE_MS = 1000 * 60 * 2; // 2 minutes

  for (const file of files) {
    if (!file.startsWith("draft-") || !file.endsWith(".json")) continue;

    const fullPath = path.join(dataDir, file);

    try {
      const draft = JSON.parse(fs.readFileSync(fullPath, "utf-8"));
      const isDone = draft.status === "complete";
      const isOld = now - fs.statSync(fullPath).mtimeMs > 1000 * 60 * 30;

      const inactiveA = draft.players?.A?.lastSeen && now - draft.players.A.lastSeen > MAX_INACTIVE_MS;
      const inactiveB = draft.players?.B?.lastSeen && now - draft.players.B.lastSeen > MAX_INACTIVE_MS;
      const bothAssigned = draft.players?.A?.id && draft.players?.B?.id;
      const wasActive = !isDone && bothAssigned;

      const shouldDelete = isDone || isOld || (bothAssigned && (inactiveA || inactiveB));

      if (shouldDelete) {
        fs.unlinkSync(fullPath);
        deleted++;

        if (wasActive) {
          const messageFile = path.join(dataDir, `message-${file.replace("draft-", "").replace(".json", "")}.json`);
          const whoTimedOut = inactiveA ? draft.players.A.name : inactiveB ? draft.players.B.name : "One player";
          const message = {
            type: "timeout",
            text: `${whoTimedOut} disconnected. The draft was closed due to inactivity.`
          };
          fs.writeFileSync(messageFile, JSON.stringify(message, null, 2));
        }
      }
    } catch (e) {
      console.error("Error deleting draft:", file, e);
    }
  }

  return NextResponse.json({ deleted });
}