"use client";

import { FormEvent, useMemo, useState } from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { useRouter, useSearchParams } from "next/navigation";
import { MessageSquare } from "lucide-react";

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
          <h3 className="text-lg font-semibold mb-2">
            Sign in to view messages
          </h3>
          <p className="text-muted-foreground mb-4">
            You need to be signed in to view and send messages.
          </p>
          <Button onClick={() => router.push("/signin")}>Sign In</Button>
        </CardContent>
      </Card>
    );
  }

  if (!conversations) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
          <h3 className="text-lg font-semibold mb-2">No messages yet</h3>
          <p className="text-muted-foreground">
            Start a conversation by contacting a seller about their listing.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
      {/* Conversations List */}
      <Card>
        <CardHeader>
          <CardTitle>Messages</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
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
                  className={`w-full border-l-2 p-3 text-left transition-colors duration-150 ${
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
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p
                          className={`truncate ${
                            isActive ? "font-semibold text-foreground" : "font-medium"
                          }`}
                        >
                          {otherUser?.name || "Unknown"}
                        </p>
                        {lastMessage && (
                          <span className="text-xs text-muted-foreground">
                            {formatTime(lastMessage._creationTime)}
                          </span>
                        )}
                      </div>
                      {lastMessage && (
                        <p className="text-sm text-muted-foreground truncate">
                          {lastMessage.body}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
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

      {/* Conversation */}
      {selectedConversation ? (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                {selectedConversation.participants.find(
                  (p) => p.userId !== selectedConversation.currentUserId,
                )?.name?.[0] || "U"}
              </div>
              <div>
                <p className="font-medium">
                  {selectedConversation.participants.find(
                    (p) => p.userId !== selectedConversation.currentUserId,
                  )?.name || "Unknown"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedConversation.listing?.title}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Messages */}
              <div className="h-96 overflow-y-auto space-y-3 rounded-lg border border-border/70 bg-background/30 p-4">
                {selectedConversation.messages.map((msg) => {
                  const isOwn =
                    msg.senderId === selectedConversation.currentUserId;
                  return (
                    <div
                      key={msg._id}
                      className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs rounded-xl px-3 py-2 shadow-sm ${
                          isOwn
                            ? "border border-primary/30 bg-primary text-primary-foreground"
                            : "border border-border/70 bg-muted/80 text-foreground"
                        }`}
                      >
                        <p className="text-sm">{msg.body}</p>
                        <p
                          className={`text-xs mt-1 ${
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

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="flex gap-2 pt-1">
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
        <Card>
          <CardContent className="p-8 text-center">
            <MessageSquare
              size={48}
              className="mx-auto mb-4 text-muted-foreground"
            />
            <h3 className="text-lg font-semibold mb-2">
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

