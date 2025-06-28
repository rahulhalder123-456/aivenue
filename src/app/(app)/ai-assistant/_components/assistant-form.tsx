
"use client";

import { useRef, useState, useEffect } from 'react';
import { askAiAssistantAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Send, User, Bot, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/auth-context';
import { db } from '@/lib/firebase';
import { doc, updateDoc, increment } from 'firebase/firestore';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { coldarkDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface Message {
    role: 'user' | 'assistant' | 'error';
    content: string;
}

function MarkdownRenderer({ content }: { content: string }) {
    return (
        <ReactMarkdown
            components={{
                code(props: any) {
                    const { children, className, node, ...rest } = props;
                    const match = /language-(\w+)/.exec(className || '');
                    return match ? (
                        <SyntaxHighlighter
                            style={coldarkDark}
                            language={match[1]}
                            PreTag="div"
                        >
                            {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                    ) : (
                        <code {...rest} className={className}>
                            {children}
                        </code>
                    );
                }
            }}
        >
            {content}
        </ReactMarkdown>
    );
}

export function AssistantForm() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isPending, setIsPending] = useState(false);
    const { user } = useAuth();
    const formRef = useRef<HTMLFormElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(() => {
        scrollToBottom();
    }, [messages, isPending]);

    const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const question = formData.get('question') as string;

        if (!question || question.trim().length === 0 || isPending) {
            return;
        }

        setIsPending(true);
        setMessages(prev => [...prev, { role: 'user', content: question }]);
        if (inputRef.current) {
            inputRef.current.value = "";
        }

        const result = await askAiAssistantAction({ message: "", errors: {}, answer: null }, formData);

        setIsPending(false);

        if (result.answer) {
            setMessages(prev => [...prev, { role: 'assistant', content: result.answer }]);
            if (user && db) {
                try {
                    const userRef = doc(db, 'users', user.uid);
                    await updateDoc(userRef, { aiAssistantQueries: increment(1) });
                } catch (error) {
                    console.error("Failed to update query count:", error);
                }
            }
        } else {
             const errorMessage = result.message || "An unknown error occurred.";
             setMessages(prev => [...prev, { role: 'error', content: `Sorry, something went wrong: ${errorMessage}` }]);
        }
        
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    return (
        <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-220px)]">
            <div className="flex-1 overflow-y-auto pr-4 space-y-4">
                {messages.map((msg, index) => (
                     <div key={index} className={`flex items-start gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                        {msg.role !== 'user' && (
                            <div className={`p-2 rounded-full flex-shrink-0 ${msg.role === 'error' ? 'bg-destructive' : 'bg-primary'} text-primary-foreground`}>
                                <Bot size={20} />
                            </div>
                        )}
                        <div className={`rounded-lg p-3 max-w-[80%] prose prose-sm prose-invert ${
                            msg.role === 'user' ? 'bg-primary text-primary-foreground' : 
                            msg.role === 'error' ? 'bg-destructive/20 text-destructive-foreground' : 'bg-secondary'
                        }`}>
                           <MarkdownRenderer content={msg.content} />
                        </div>
                        {msg.role === 'user' && (
                          <div className="p-2 rounded-full bg-secondary flex-shrink-0">
                            <User size={20} />
                          </div>
                        )}
                    </div>
                ))}
                {isPending && (
                    <div className="flex items-start gap-4">
                        <div className="p-2 rounded-full bg-primary text-primary-foreground flex-shrink-0"><Bot size={20} /></div>
                        <div className="rounded-lg p-3 bg-secondary space-y-2 w-48">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-2/3" />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleFormSubmit} ref={formRef} className="mt-4 sticky bottom-0">
                <Card>
                    <CardContent className="p-2 relative">
                         <Textarea
                            ref={inputRef}
                            name="question"
                            placeholder="Ask a technical question..."
                            className="pr-12 min-h-[60px] max-h-40"
                            required
                            disabled={isPending}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    if (!isPending) {
                                      formRef.current?.requestSubmit();
                                    }
                                }
                            }}
                        />
                        <Button size="icon" type="submit" disabled={isPending} className="absolute right-4 bottom-4">
                            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            <span className="sr-only">Send</span>
                        </Button>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}
