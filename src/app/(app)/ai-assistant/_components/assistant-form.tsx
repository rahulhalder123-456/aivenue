"use client";

import { useFormState } from 'react-dom';
import { askAiAssistantAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Send, User, Bot, Loader2 } from 'lucide-react';
import { useEffect, useRef, useState, useTransition } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/auth-context';
import { db } from '@/lib/firebase';
import { doc, updateDoc, increment } from 'firebase/firestore';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export function AssistantForm() {
    const [state, formAction] = useFormState(askAiAssistantAction, { message: "", errors: {}, answer: null });
    const [messages, setMessages] = useState<Message[]>([]);
    const [isPending, startTransition] = useTransition();
    const { user } = useAuth();
    const formRef = useRef<HTMLFormElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(scrollToBottom, [messages, isPending]);

    useEffect(() => {
        const updateUserQueryCount = async () => {
            if (user && db) {
                try {
                    const userRef = doc(db, 'users', user.uid);
                    await updateDoc(userRef, {
                        aiAssistantQueries: increment(1)
                    });
                } catch (error) {
                    console.error("Failed to update query count:", error);
                    // Don't show an error to the user, just log it.
                }
            }
        };

        if (isPending) return;

        if (state.answer) {
            setMessages(prev => [...prev, { role: 'assistant', content: state.answer! }]);
            updateUserQueryCount();
        } else if (state.message && state.message !== "Success") {
            if (messages.length === 0 || messages[messages.length-1].role !== 'assistant' || !messages[messages.length-1].content.startsWith("Error:")) {
                 setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${state.message}` }]);
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state, isPending]); // Added isPending to dependencies

    const handleFormSubmit = (formData: FormData) => {
        const question = formData.get('question') as string;
        if (question && question.trim().length > 0) {
            setMessages(prev => [...prev, { role: 'user', content: question }]);
            startTransition(() => {
                formAction(formData);
                const questionTextarea = formRef.current?.elements.namedItem('question') as HTMLTextAreaElement;
                if (questionTextarea) {
                    questionTextarea.value = '';
                }
            });
        }
    };

    return (
        <div className="max-w-3xl mx-auto flex flex-col h-[calc(80vh-120px)]">
            <div className="flex-1 overflow-y-auto pr-4 space-y-4">
                {messages.map((msg, index) => (
                     <div key={index} className={`flex items-start gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                        {msg.role === 'assistant' && <div className="p-2 rounded-full bg-primary text-primary-foreground flex-shrink-0"><Bot size={20} /></div>}
                        <div className={`rounded-lg p-3 max-w-[80%] ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                            <pre className="whitespace-pre-wrap font-code text-sm">{msg.content}</pre>
                        </div>
                        {msg.role === 'user' && <div className="p-2 rounded-full bg-secondary flex-shrink-0"><User size={20} /></div>}
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

            <form action={handleFormSubmit} ref={formRef} className="mt-4 sticky bottom-0">
                <Card>
                    <CardContent className="p-2 relative">
                         <Textarea
                            name="question"
                            placeholder="Ask a technical question..."
                            className="pr-12 min-h-[60px] max-h-40"
                            required
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    formRef.current?.requestSubmit();
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
