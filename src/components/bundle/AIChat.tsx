
import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { MessageCircle, Send } from "lucide-react";

type Bundle = {
  id: string;
  name: string;
  raw_data: any[];
  columns_info: Record<string, any>;
  summary_stats: Record<string, any>;
};

type Message = {
  id: string;
  message: string;
  response?: string;
  created_at: string;
};

const AIChat = ({ bundle }: { bundle: Bundle }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const { data, error } = await supabase
          .from("chat_messages")
          .select("*")
          .eq("bundle_id", bundle.id)
          .order("created_at", { ascending: true });

        if (error) throw error;
        setMessages(data || []);
      } catch (error) {
        console.error("Error loading messages:", error);
      }
    };

    loadMessages();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('chat_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_messages',
          filter: `bundle_id=eq.${bundle.id}`,
        },
        loadMessages
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [bundle.id]);

  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      setLoading(true);
      const { error } = await supabase.from("chat_messages").insert({
        bundle_id: bundle.id,
        user_id: user?.id,
        message: newMessage,
      });

      if (error) throw error;
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="flex flex-col h-[calc(100vh-250px)] bg-background">
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <MessageCircle className="h-12 w-12 mb-4" />
              <p className="text-lg font-medium">Start a conversation about your data</p>
              <p className="text-sm">Ask questions about trends, patterns, or specific data points</p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div 
                key={message.id} 
                className="space-y-2"
                ref={index === messages.length - 1 ? lastMessageRef : null}
              >
                <div className="bg-accent/20 rounded-lg p-3 animate-fade-in">
                  <p className="whitespace-pre-wrap">{message.message}</p>
                </div>
                {message.response && (
                  <div className="bg-primary/10 rounded-lg p-3 ml-4 animate-slide-in-right">
                    <p className="whitespace-pre-wrap">{message.response}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
      
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Ask about your data..."
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            disabled={loading}
          />
          <Button 
            onClick={sendMessage} 
            disabled={loading}
            className="flex items-center gap-2"
          >
            {loading ? (
              "Sending..."
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default AIChat;

