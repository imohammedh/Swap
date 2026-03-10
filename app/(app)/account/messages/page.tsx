"use client";

import { FormEvent, useMemo, useState } from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, MessageSquare } from "lucide-react";

import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

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
  const { isAuthenticated } = useConvexAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const conversationId = searchParams.get("id");

  const conversations = useQuery(api.messages.listMine, {});
  const sendMessage = useMutation(api.messages.sendMessage);

  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const selectedConversation = useMemo(() => {
    if (!conversationId || !conversations) return null;
    return conversations.find((c) => c._id === conversationId);
  }, [conversationId, conversations]);

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !selectedConversation) return;

    setSending(true);
    try {
      await sendMessage({
        conversationId: selectedConversation._id,
        body: message.trim(),
      });
      setMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setSending(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <MessageSquare
            size={48}
            className="mx-auto mb-4 text-muted-foreground"
          />
          <h3 className="mb-2 text-lg font-semibold">
            Sign in to view messages
          </h3>
          <p className="mb-4 text-muted-foreground">
            You need to be signed in to view and send messages.
          </p>
          <Button onClick={() => router.push("/signin")}>Sign In</Button>
        </CardContent>
      </Card>
    );
  }

  if (!conversations) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <MessageSquare
            size={48}
            className="mx-auto mb-4 text-muted-foreground"
          />
          <h3 className="mb-2 text-lg font-semibold">No messages yet</h3>
          <p className="text-muted-foreground">
            Start a conversation by contacting a seller about their listing.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
      <Card
        className={cn(
          selectedConversation ? "hidden lg:block" : "block",
          "overflow-hidden",
        )}
      >
        <CardHeader>
          <CardTitle>Messages</CardTitle>
        </CardHeader>
        <CardContent className="overflow-hidden p-0">
          <div className="space-y-1">
            {conversations.map((conversation) => {
              const otherUser = conversation.participants.find(
                (p) => p.userId !== conversation.currentUserId,
              );
              const lastMessage =
                conversation.messages[conversation.messages.length - 1];
              const isActive = conversationId === conversation._id;

              return (
                <button
                  key={conversation._id}
                  onClick={() =>
                    router.push(`/account/messages?id=${conversation._id}`)
                  }
                  aria-current={isActive ? "page" : undefined}
                  className={`w-full overflow-hidden border-l-2 p-3 text-left transition-colors duration-150 ${
                    isActive
                      ? "border-l-primary bg-primary/15 shadow-sm hover:bg-primary/20"
                      : "border-l-transparent hover:border-l-primary/60 hover:bg-primary/10"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "bg-primary/10 text-primary"
                      }`}
                    >
                      {otherUser?.name?.[0] || "U"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                        <p
                          className={`line-clamp-1 ${
                            isActive
                              ? "font-semibold text-foreground"
                              : "font-medium"
                          }`}
                        >
                          {otherUser?.name || "Unknown"}
                        </p>
                        {lastMessage && (
                          <span className="shrink-0 self-start text-xs text-muted-foreground sm:self-auto">
                            {formatTime(lastMessage._creationTime)}
                          </span>
                        )}
                      </div>
                      {lastMessage && (
                        <p className="line-clamp-2 break-words text-sm leading-snug text-muted-foreground">
                          {lastMessage.body}
                        </p>
                      )}
                      <p className="mt-1 line-clamp-1 break-words text-xs text-muted-foreground">
                        {conversation.listing?.title}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {selectedConversation ? (
        <Card className="min-w-0 h-fit">
          <CardHeader className="space-y-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                {selectedConversation.participants.find(
                  (p) => p.userId !== selectedConversation.currentUserId,
                )?.name?.[0] || "U"}
              </div>
              <div className="min-w-0">
                <p className="truncate font-medium">
                  {selectedConversation.participants.find(
                    (p) => p.userId !== selectedConversation.currentUserId,
                  )?.name || "Unknown"}
                </p>
                <p className="line-clamp-2 break-words text-sm leading-snug text-muted-foreground">
                  {selectedConversation.listing?.title}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="h-[60vh] max-h-96 space-y-3 overflow-y-auto rounded-lg border border-border/70 bg-background/30 p-3 sm:p-4">
                {selectedConversation.messages.map((msg) => {
                  const isOwn =
                    msg.senderId === selectedConversation.currentUserId;
                  return (
                    <div
                      key={msg._id}
                      className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-xl px-3 py-2 shadow-sm sm:max-w-xs ${
                          isOwn
                            ? "border border-primary/30 bg-primary text-primary-foreground"
                            : "border border-border/70 bg-muted/80 text-foreground"
                        }`}
                      >
                        <p className="break-words text-sm">{msg.body}</p>
                        <p
                          className={`mt-1 text-xs ${
                            isOwn
                              ? "text-primary-foreground/70"
                              : "text-foreground/60"
                          }`}
                        >
                          {formatDateTime(msg._creationTime)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <form
                onSubmit={handleSendMessage}
                className="flex flex-col gap-2 pt-1 sm:flex-row"
              >
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  disabled={sending}
                  className="h-10 border-border/70 bg-background/70 transition-colors placeholder:text-muted-foreground/80 focus-visible:border-primary/70 focus-visible:ring-2 focus-visible:ring-primary/40"
                />
                <Button
                  type="submit"
                  disabled={sending || !message.trim()}
                  className="h-10 min-w-20 px-4 font-medium transition-colors duration-150 hover:bg-primary/90 active:bg-primary/80 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {sending ? "Sending..." : "Send"}
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="hidden lg:block h-fit">
          <CardContent className="p-8 text-center">
            <MessageSquare
              size={48}
              className="mx-auto mb-4 text-muted-foreground"
            />
            <h3 className="mb-2 text-lg font-semibold">
              Select a conversation
            </h3>
            <p className="text-muted-foreground">
              Choose a conversation from the list to start messaging.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
