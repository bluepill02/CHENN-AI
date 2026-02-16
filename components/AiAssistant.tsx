import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from './ui/sheet';
import { ScrollArea } from './ui/scroll-area';
import { Avatar } from './ui/avatar';
import { Bot, Send, User, Sparkles, Loader2, X } from 'lucide-react';
import { AiService } from '../services/AiService';
import { useAuth } from './auth/SupabaseAuthProvider';
import { IllustratedIcon, ChennaiIcons } from './IllustratedIcon';

export function AiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    { role: 'assistant', content: 'Vanakkam! I am CHENN-AI. How can I help you today? Ask me about bus routes, food spots, or local events! 🙏' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await AiService.chat(userMessage);
      if (response.content) {
        setMessages(prev => [...prev, { role: 'assistant', content: response.content }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: response.error || 'Sorry, I encountered an error. Please try again.' }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I am having trouble connecting right now.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          className="fixed bottom-24 left-6 h-14 w-14 rounded-full bg-gradient-to-r from-orange-500 to-yellow-500 shadow-lg hover:shadow-xl transition-all duration-300 z-50 flex items-center justify-center border-2 border-white"
          size="icon"
          aria-label="Open AI Assistant"
        >
          <Sparkles className="w-6 h-6 text-white animate-pulse" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md flex flex-col h-full p-0 bg-orange-50/50 backdrop-blur-sm overflow-hidden">
        <SheetHeader className="p-4 bg-gradient-to-r from-orange-400 to-orange-500 text-white shrink-0">
          <SheetTitle className="text-white flex items-center gap-2">
            <Bot className="w-6 h-6" />
            CHENN-AI Assistant
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 min-h-0 p-4" ref={scrollAreaRef}>
          <div className="space-y-4 pb-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <Avatar className="w-8 h-8 bg-orange-100 border border-orange-200">
                    <div className="w-full h-full flex items-center justify-center text-orange-600">
                      <Bot className="w-5 h-5" />
                    </div>
                  </Avatar>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${msg.role === 'user'
                    ? 'bg-orange-500 text-white rounded-br-none'
                    : 'bg-white border border-orange-100 text-gray-800 rounded-bl-none shadow-sm'
                    }`}
                >
                  {msg.content}
                </div>
                {msg.role === 'user' && (
                  <Avatar className="w-8 h-8 bg-gray-100 border border-gray-200">
                    <div className="w-full h-full flex items-center justify-center text-gray-600">
                      <User className="w-5 h-5" />
                    </div>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <Avatar className="w-8 h-8 bg-orange-100 border border-orange-200">
                  <div className="w-full h-full flex items-center justify-center text-orange-600">
                    <Bot className="w-5 h-5" />
                  </div>
                </Avatar>
                <div className="bg-white border border-orange-100 rounded-2xl rounded-bl-none px-4 py-2 shadow-sm flex items-center">
                  <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 bg-white border-t border-orange-100">
          <div className="flex gap-2">
            <Input
              placeholder="Ask about Chennai..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 border-orange-200 focus-visible:ring-orange-500"
              disabled={isLoading}
            />
            <Button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="bg-orange-500 hover:bg-orange-600 text-white"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
