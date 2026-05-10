import { useState, useEffect, useRef, useCallback } from "react";
import { format } from "date-fns";
import { Loader2, MessageCircle, SendHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type ChatMessage = {
  id: string;
  author_id: string;
  body: string;
  created_at: string;
};

interface ChatTabProps {
  userId: string;
  profileNameByUserId: Map<string, string>;
  isMasterAdmin: boolean;
}

const ChatTab = ({ userId, profileNameByUserId, isMasterAdmin }: ChatTabProps) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getDisplayName = (uid: string) => {
    return profileNameByUserId.get(uid) ?? "Član portala";
  };

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("chat_messages" as never)
        .select("*")
        .order("created_at", { ascending: true })
        .limit(200);

      if (error) throw error;
      setMessages((data ?? []) as unknown as ChatMessage[]);
    } catch (error) {
      toast({ title: "Greška pri učitavanju poruka", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadMessages();

    // Subscribe to realtime
    const channel = supabase
      .channel("chat-messages")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "chat_messages" },
        () => {
          void loadMessages();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (!loading) scrollToBottom();
  }, [messages, loading, scrollToBottom]);

  const handleSend = async () => {
    const body = draft.trim();
    if (!body) return;

    setSending(true);
    try {
      const { error } = await supabase.from("chat_messages" as never).insert({
        author_id: userId,
        body,
      } as never);

      if (error) throw error;
      setDraft("");
    } catch (error) {
      toast({
        title: "Poruka nije poslana",
        description: error instanceof Error ? error.message : "",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (messageId: string) => {
    const { error } = await supabase.from("chat_messages" as never).delete().eq("id", messageId);
    if (error) {
      toast({ title: "Brisanje poruke nije uspjelo", variant: "destructive" });
    }
  };

  // Group messages by date
  const groupedMessages = messages.reduce<{ date: string; msgs: ChatMessage[] }[]>((acc, msg) => {
    const dateStr = format(new Date(msg.created_at), "dd.MM.yyyy.");
    const lastGroup = acc[acc.length - 1];
    if (lastGroup && lastGroup.date === dateStr) {
      lastGroup.msgs.push(msg);
    } else {
      acc.push({ date: dateStr, msgs: [msg] });
    }
    return acc;
  }, []);

  return (
    <Card className="flex flex-col" style={{ height: "calc(100vh - 280px)" }}>
      <CardHeader className="shrink-0 pb-3">
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Interni chat
        </CardTitle>
        <CardDescription>Interna komunikacija članova portala u stvarnom vremenu.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col overflow-hidden">
        {/* Messages area */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-3">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Učitavam poruke...
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
              Nema poruka. Započnite razgovor!
            </div>
          ) : (
            groupedMessages.map((group) => (
              <div key={group.date}>
                <div className="flex items-center gap-3 my-3">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-muted-foreground font-medium">{group.date}</span>
                  <div className="flex-1 h-px bg-border" />
                </div>
                <div className="space-y-2">
                  {group.msgs.map((msg) => {
                    const isOwn = msg.author_id === userId;
                    return (
                      <div
                        key={msg.id}
                        className={`flex gap-2 group ${isOwn ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[75%] rounded-xl px-3 py-2 ${
                            isOwn
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          <p className="text-xs font-medium mb-0.5 opacity-80">
                            {getDisplayName(msg.author_id)}
                          </p>
                          <p className="text-sm whitespace-pre-wrap break-words">{msg.body}</p>
                          <p className={`text-[10px] mt-1 ${isOwn ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                            {format(new Date(msg.created_at), "HH:mm")}
                          </p>
                        </div>
                        {(isOwn || isMasterAdmin) && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 self-center text-destructive"
                            onClick={() => handleDelete(msg.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="flex gap-2 shrink-0 pt-2 border-t border-border">
          <Input
            placeholder="Napiši poruku..."
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void handleSend();
              }
            }}
            disabled={sending}
          />
          <Button
            size="icon"
            disabled={!draft.trim() || sending}
            onClick={() => void handleSend()}
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <SendHorizontal className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatTab;
