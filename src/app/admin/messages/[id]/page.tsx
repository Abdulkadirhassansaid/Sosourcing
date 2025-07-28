
"use client"

import * as React from 'react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { ArrowLeft, File, Paperclip, Send, User, Download, Image as ImageIcon } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useMessages, Message } from '@/hooks/use-messages';
import { useOrders } from '@/hooks/use-orders';
import { auth } from '@/lib/firebase';
import { format } from 'date-fns';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { Progress } from '@/components/ui/progress';

export default function AdminMessageDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string; // This is the order ID / conversation ID
    
    const [user, setUser] = React.useState<FirebaseUser | null>(null);
    const [loadingAuth, setLoadingAuth] = React.useState(true);
    const { orders } = useOrders();
    const order = orders.find(o => o.id === id);
    const { messages, loading: loadingMessages, sendMessage, uploading, uploadProgress } = useMessages(id);
    const [newMessage, setNewMessage] = React.useState("");
    const scrollViewportRef = React.useRef<HTMLDivElement>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

     React.useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoadingAuth(false);
        });
        return () => unsubscribe();
    }, []);

    React.useEffect(() => {
        if (scrollViewportRef.current) {
            scrollViewportRef.current.scrollTop = scrollViewportRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !user || !order) return;
        
        await sendMessage({
            text: newMessage,
        });
        setNewMessage("");
    }

     const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            await sendMessage({
                file: file,
            });
        }
    };

    const triggerFileSelect = () => {
        fileInputRef.current?.click();
    };

    if (loadingAuth || loadingMessages) {
        return <div className="flex h-screen items-center justify-center"><p>Loading conversation...</p></div>;
    }
    
    if (!order) {
        return (
             <div className="flex items-center justify-center py-12">
                <Card>
                    <CardHeader>
                        <CardTitle>Conversation Not Found</CardTitle>
                        <CardDescription>The requested chat thread could not be found.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={() => router.push('/admin/messages')}>Back to Messages</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }
    
    const customerName = order.customerName || "Customer";
    const customerAvatarFallback = customerName.charAt(0).toUpperCase();
  
    return (
        <div className="flex flex-col h-[calc(100vh-theme(spacing.24))]">
             <header className="flex items-center gap-4 border-b p-4">
                <Button variant="outline" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">Go Back</span>
                </Button>
                <div className="flex-1">
                    <h2 className="text-xl font-bold truncate">{order.productName}</h2>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <User className="h-4 w-4"/>
                        Customer: {customerName}
                    </p>
                </div>
                 <Link href={`/admin/orders/${order.id}`}>
                    <Button variant="outline">View Order</Button>
                </Link>
            </header>

            <div className="flex-1 overflow-hidden">
                 <ScrollArea className="h-full" viewportRef={scrollViewportRef}>
                    <div className="space-y-6 p-6 bg-secondary/30">
                        {messages.map((msg, index) => {
                            const isAdminSender = msg.senderId === user?.uid;
                            const isImageFile = msg.fileType?.startsWith('image/');

                            return (
                                <div key={index} className={cn("flex items-end gap-3 w-full", isAdminSender ? 'flex-row-reverse' : 'flex-row')}>
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={isAdminSender ? undefined : order.customerAvatar} alt={msg.senderName} data-ai-hint="business person" />
                                        <AvatarFallback>{isAdminSender ? 'A' : customerAvatarFallback}</AvatarFallback>
                                    </Avatar>
                                    <div className={cn("max-w-md rounded-lg p-3 relative", isAdminSender ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-background border rounded-bl-none')}>
                                        <p className="font-semibold text-sm mb-1">{isAdminSender ? "You (Admin)" : customerName}</p>
                                        {msg.type === 'file' ? (
                                            isImageFile ? (
                                                 <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer">
                                                    <img src={msg.fileUrl} alt="uploaded content" className="rounded-md max-w-full h-auto cursor-pointer"/>
                                                 </a>
                                            ) : (
                                                 <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-secondary/20 p-2 rounded-md hover:bg-secondary/40">
                                                    <Download className="h-6 w-6" />
                                                    <div className="truncate">
                                                        <p className="text-sm font-medium">{msg.fileName}</p>
                                                        <p className="text-xs opacity-80">{msg.fileType}</p>
                                                    </div>
                                                </a>
                                            )
                                        ) : (
                                            <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                                        )}
                                        <p className="text-xs mt-2 opacity-70 text-right">{format(new Date(msg.timestamp), 'p')}</p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </ScrollArea>
            </div>
           
            <footer className="p-4 border-t bg-background">
                {uploading && (
                    <div className="px-4 pb-2">
                        <Progress value={uploadProgress} className="w-full h-2" />
                        <p className="text-center text-xs text-muted-foreground mt-1">Uploading... {Math.round(uploadProgress)}%</p>
                    </div>
                )}
                <div className="relative">
                    <Input 
                        placeholder="Type your message..." 
                        className="pr-24 h-12" 
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        disabled={uploading}
                    />
                     <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                        <Input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" onClick={triggerFileSelect} disabled={uploading}>
                                        <Paperclip className="text-muted-foreground"/>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>Attach File</p></TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <Button variant="default" size="sm" className="ml-2" onClick={handleSendMessage} disabled={!newMessage.trim() || uploading}>
                            <Send className="mr-2 h-4 w-4" /> Send
                        </Button>
                    </div>
                </div>
            </footer>
        </div>
    );
}
