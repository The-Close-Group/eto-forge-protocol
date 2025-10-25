import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2, Sparkles, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { TradeCard } from "@/components/chat/TradeCard";
import { PortfolioCard } from "@/components/chat/PortfolioCard";
import { ChartCard } from "@/components/chat/ChartCard";
import { useActiveAccount } from "thirdweb/react";

interface Message {
  role: 'user' | 'assistant' | 'component';
  content: string;
  component?: {
    type: 'trade_card' | 'portfolio' | 'chart';
    data: any;
  };
}

export default function AIAssistant() {
  const { user } = useAuth();
  const account = useActiveAccount();
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      content: '👋 Hey! I\'m your AI trading assistant. I can help you trade MAANG, check your portfolio, analyze prices, and execute trades directly from this chat. Try asking me:\n\n• "Show my portfolio"\n• "What\'s the price of MAANG?"\n• "Buy 100 MAANG with USDC"\n• "Show me MAANG price chart"'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-assistant`;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const streamChat = async (userMessage: string) => {
    const newMessages = [...messages, { role: 'user' as const, content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);
    
    try {
      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ 
          messages: newMessages.filter(m => m.role !== 'component').map(m => ({ role: m.role, content: m.content })),
          userId: user?.id 
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error('Failed to start stream');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      let streamDone = false;
      let assistantContent = '';

      // Add empty assistant message
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            
            // Handle tool results
            if (parsed.type === 'tool_result') {
              const result = parsed.result;
              if (result.type === 'trade_card') {
                setMessages(prev => [...prev, {
                  role: 'component',
                  content: '',
                  component: { type: 'trade_card', data: result }
                }]);
              } else if (result.type === 'portfolio') {
                setMessages(prev => [...prev, {
                  role: 'component',
                  content: '',
                  component: { type: 'portfolio', data: result.data }
                }]);
              } else if (result.type === 'chart') {
                setMessages(prev => [...prev, {
                  role: 'component',
                  content: '',
                  component: { type: 'chart', data: result }
                }]);
              }
              continue;
            }
            
            // Handle regular content
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const newMessages = [...prev];
                const lastMsg = newMessages[newMessages.length - 1];
                if (lastMsg.role === 'assistant') {
                  newMessages[newMessages.length - 1] = { role: 'assistant', content: assistantContent };
                }
                return newMessages;
              });
            }
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    const userInput = input;
    setInput('');
    await streamChat(userInput);
  };

  const renderMessage = (message: Message, index: number) => {
    if (message.component) {
      if (message.component.type === 'trade_card') {
        return (
          <div key={index} className="flex justify-start">
            <div className="max-w-[80%]">
              <TradeCard {...message.component.data} />
            </div>
          </div>
        );
      } else if (message.component.type === 'portfolio') {
        return (
          <div key={index} className="flex justify-start">
            <div className="max-w-[80%]">
              <PortfolioCard balances={message.component.data} />
            </div>
          </div>
        );
      } else if (message.component.type === 'chart') {
        return (
          <div key={index} className="flex justify-start">
            <div className="max-w-[80%]">
              <ChartCard {...message.component.data} />
            </div>
          </div>
        );
      }
    }

    return (
      <div
        key={index}
        className={cn(
          "flex",
          message.role === 'user' ? "justify-end" : "justify-start"
        )}
      >
        <div
          className={cn(
            "max-w-[80%] rounded-2xl px-4 py-3",
            message.role === 'user'
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-foreground"
          )}
        >
          <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <div className="border-b border-border/40 bg-card/50 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">AI Trading Assistant</h1>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <p className="text-xs text-muted-foreground">Connected & Ready</p>
                </div>
              </div>
            </div>
            {account && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20">
                <Wallet className="h-4 w-4 text-primary" />
                <span className="text-xs font-mono">
                  {account.address.slice(0, 6)}...{account.address.slice(-4)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 container mx-auto px-4" ref={scrollRef}>
        <div className="space-y-4 py-6 max-w-4xl mx-auto">
          {messages.map((message, index) => renderMessage(message, index))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted text-foreground rounded-2xl px-4 py-3">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t border-border/40 bg-card/50 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me to trade, check prices, or show your portfolio..."
                disabled={isLoading}
                className="flex-1 h-12 bg-background"
              />
              <Button 
                type="submit" 
                size="icon" 
                disabled={isLoading || !input.trim()}
                className="h-12 w-12"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
