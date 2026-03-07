"use client";

import { FormEvent, useMemo, useState } from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { useRouter, useSearchParams } from "next/navigation";
import { MessageSquare } from "lucide-react";

import type { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

function formatTime(time: number) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(time));
}

function formatDateTime(time: number) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(time));
}

export default function MessagesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useConvexAuth();

  const conversationsResult = useQuery(api.messages.listMine, {});
  const conversations = useMemo(() => conversationsResult ?? [], [conversationsResult]);

  const sendMessage = useMutation(api.messages.sendMessage);
  const markConversationRead = useMutation(api.messages.markConversationRead);

  const [selectedConversationId, setSelectedConversationId] = useState<Id<"conversations"> | null>(null);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);

  const requestedConversationId = searchParams.get("conversation") as Id<"conversations"> | null;

  const resolvedConversationId = useMemo(() => {
    if (
      requestedConversationId &&
      conversations.some((conversation) => conversation._id === requestedConversationId)
    ) {
      return requestedConversationId;
    }

    if (
      selectedConversationId &&
      conversations.some((conversation) => conversation._id === selectedConversationId)
    ) {
      return selectedConversationId;
    }

    return conversations[0]?._id ?? null;
  }, [conversations, requestedConversationId, selectedConversationId]);

  const selectedConversation = useMemo(
    () =>
      conversations.find(
        (conversation) => conversation._id === resolvedConversationId,
      ) ?? null,
    [conversations, resolvedConversationId],
  );

  const messages = useQuery(
    api.messages.getMessages,
    resolvedConversationId ? { conversationId: resolvedConversationId } : "skip",
  );

  const handleSelectConversation = (conversationId: Id<"conversations">) => {
    setSelectedConversationId(conversationId);
    void markConversationRead({ conversationId });
    router.replace(`/account/messages?conversation=${conversationId}`);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!resolvedConversationId) return;

    try {
      await sendMessage({
        conversationId: resolvedConversationId,
        body: draft,
      });
      await markConversationRead({ conversationId: resolvedConversationId });
      setDraft("");
      setError(null);
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Failed to send message.",
      );
    }
  };

  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Messages</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Sign in to view and send messages.
          </p>
          <Button onClick={() => router.push("/signin")}>Sign in</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Messages</CardTitle>
      </CardHeader>
      <CardContent>
        {conversations.length === 0 ? (
          <div className="grid min-h-[520px] place-items-center rounded-lg border bg-muted/20 text-center">
            <div className="space-y-2">
              <MessageSquare className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="text-2xl font-semibold">No conversations yet</p>
              <p className="text-sm text-muted-foreground">
                Open a listing and tap Message to start chat with the seller.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid min-h-[600px] gap-3 md:grid-cols-[280px_1fr]">
            <div className="overflow-hidden rounded-lg border bg-card">
              <div className="max-h-[600px] overflow-y-auto">
                {conversations.map((conversation) => {
                  const isActive = conversation._id === resolvedConversationId;
                  return (
                    <button
                      key={conversation._id}
                      type="button"
                      onClick={() => handleSelectConversation(conversation._id)}
                      className={`w-full border-b px-3 py-3 text-left transition ${
                        isActive ? "bg-primary/10" : "hover:bg-muted/40"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-semibold">
                          {conversation.otherUserName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatTime(conversation.lastMessageAt)}
                        </p>
                      </div>
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {conversation.listingTitle}
                      </p>
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {conversation.lastMessagePreview || "No messages yet"}
                      </p>
                      {conversation.unreadCount > 0 && (
                        <span className="mt-2 inline-flex rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                          {conversation.unreadCount} new
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex min-h-[600px] flex-col overflow-hidden rounded-lg border bg-card">
              {selectedConversation ? (
                <>
                  <div className="border-b px-4 py-3">
                    <p className="text-sm font-semibold">
                      {selectedConversation.otherUserName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {selectedConversation.listingTitle}
                    </p>
                  </div>

                  <div className="flex-1 space-y-3 overflow-y-auto bg-muted/20 p-4">
                    {messages?.map((message) => (
                      <div
                        key={message._id}
                        className={`max-w-[82%] rounded-lg border px-3 py-2 text-sm ${
                          message.isMine
                            ? "ml-auto bg-primary text-primary-foreground"
                            : "bg-card"
                        }`}
                      >
                        <p className="text-xs opacity-80">{message.senderName}</p>
                        <p>{message.body}</p>
                        <p className="mt-1 text-[11px] opacity-80">
                          {formatDateTime(message.createdAt)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={(event) => void handleSubmit(event)} className="space-y-2 border-t p-3">
                    <div className="flex gap-2">
                      <Input
                        value={draft}
                        onChange={(event) => setDraft(event.target.value)}
                        placeholder="Write a message..."
                        className="h-11"
                      />
                      <Button type="submit" className="h-11" disabled={!draft.trim()}>
                        Send
                      </Button>
                    </div>
                    {error && <p className="text-xs text-destructive">{error}</p>}
                  </form>
                </>
              ) : (
                <div className="grid flex-1 place-items-center p-6 text-center text-sm text-muted-foreground">
                  Select a conversation to start messaging.
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
