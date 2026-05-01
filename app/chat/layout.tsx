import type { Metadata } from "next";
import { Suspense } from "react";
import ChatPage from "./page";

export const metadata: Metadata = {
  title: "Chat with Ballot Guide — BallotFlow",
  description:
    "Ask our AI election guide anything about voter registration, ballot types, polling locations, and election timelines.",
};

export default function ChatLayout() {
  return (
    <Suspense fallback={<div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100dvh", background: "var(--color-bg-base)", color: "var(--color-text-secondary)" }}>Loading chat...</div>}>
      <ChatPage />
    </Suspense>
  );
}
