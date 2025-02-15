import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { MessageCircle, Send, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from 'react-markdown';

type Bundle = {
  id: string;
  name: string;
  raw_data: any[];
  columns_info: Record<string, any>;
  summary_stats: Record<string, any>;
};

type MessageStatus = 'pending' | 'completed' | 'error';

type Message = {
  id: string;
  message: string;
  response?: string;
  response_status: MessageStatus;
  created_at: string;
};

const isValidMessageStatus = (status: string): status is MessageStatus => {
  return ['pending', 'completed', 'error'].includes(status);
};

const convertToMessage = (data: any): Message => {
  return {
    ...data,
    response_status: isValidMessageStatus(data.response_status) 
      ? data.response_status 
      : 'error' // Default to error if status is invalid
  };
};

const AIChat = ({ bundle }: { bundle: Bundle }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
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
        setMessages((data || []).map(convertToMessage));
      } catch (error) {
        console.error("Error loading messages:", error);
      }
    };

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
        (payload) => {
          // Handle different types of changes
          if (payload.eventType === 'INSERT') {
            setMessages(prev => [...prev, convertToMessage(payload.new)]);
          } else if (payload.eventType === 'UPDATE') {
            setMessages(prev => 
              prev.map(msg => 
                msg.id === payload.new.id ? convertToMessage(payload.new) : msg
              )
            );
          }
        }
      )
      .subscribe();

    loadMessages();

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
    if (!user) {
      navigate("/auth");
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.from("chat_messages").insert({
        bundle_id: bundle.id,
        user_id: user?.id,
        message: newMessage,
        response_status: 'pending'
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
          <AnimatePresence>
            {messages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col items-center justify-center h-full text-muted-foreground"
              >
                <MessageCircle className="h-12 w-12 mb-4" />
                <p className="text-lg font-medium">Start a conversation about your data</p>
                <p className="text-sm">Ask questions about trends, patterns, or specific data points</p>
              </motion.div>
            ) : (
              messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-2"
                  ref={index === messages.length - 1 ? lastMessageRef : null}
                >
                  <div className="bg-accent/20 rounded-lg p-3">
                    <p className="whitespace-pre-wrap">{message.message}</p>
                  </div>
                  {message.response_status === 'pending' ? (
                    <motion.div
                      initial={{ opacity: 0.5 }}
                      animate={{ opacity: 1 }}
                      transition={{ repeat: Infinity, duration: 1 }}
                      className="bg-primary/10 rounded-lg p-3 ml-4 flex items-center gap-2"
                    >
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">AI is thinking...</span>
                    </motion.div>
                  ) : message.response && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-primary/10 rounded-lg p-3 ml-4 prose prose-sm dark:prose-invert"
                    >
                      <ReactMarkdown>{message.response}</ReactMarkdown>
                    </motion.div>
                  )}
                </motion.div>
              ))
            )}
          </AnimatePresence>
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
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending...
              </>
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
