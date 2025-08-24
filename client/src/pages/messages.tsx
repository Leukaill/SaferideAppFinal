import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, Send, MessageSquare, User, Plus } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Message, User as UserType } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function Messages() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedAdmin, setSelectedAdmin] = useState<UserType | null>(null);
  const [newMessageSubject, setNewMessageSubject] = useState("");
  const [newMessageContent, setNewMessageContent] = useState("");
  const [showNewMessage, setShowNewMessage] = useState(false);

  const { data: messages = [] } = useQuery<Message[]>({
    queryKey: ['/api/messages'],
    enabled: !!user,
  });

  const { data: admins = [] } = useQuery<UserType[]>({
    queryKey: ['/api/admins'],
    enabled: !!user,
  });

  const { data: conversation = [] } = useQuery<Message[]>({
    queryKey: ['/api/messages/conversation', selectedAdmin?.id],
    enabled: !!selectedAdmin,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: { recipientId: string; subject: string; content: string }) => {
      const response = await apiRequest('POST', '/api/messages', messageData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Message sent",
        description: "Your message has been sent to the administrator",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
      if (selectedAdmin) {
        queryClient.invalidateQueries({ queryKey: ['/api/messages/conversation', selectedAdmin.id] });
      }
      setNewMessageSubject("");
      setNewMessageContent("");
      setShowNewMessage(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    },
  });

  const handleBack = () => {
    if (selectedAdmin) {
      setSelectedAdmin(null);
    } else {
      switch (user?.role) {
        case 'parent':
          setLocation('/parent-dashboard');
          break;
        case 'driver':
          setLocation('/driver-dashboard');
          break;
        case 'admin':
          setLocation('/admin-dashboard');
          break;
        case 'manager':
          setLocation('/manager-dashboard');
          break;
        default:
          setLocation('/');
      }
    }
  };

  const handleSendMessage = () => {
    if (!selectedAdmin || !newMessageSubject.trim() || !newMessageContent.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in both subject and message",
        variant: "destructive",
      });
      return;
    }

    sendMessageMutation.mutate({
      recipientId: selectedAdmin.id,
      subject: newMessageSubject,
      content: newMessageContent,
    });
  };

  const formatTime = (date: string | Date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const groupedMessages = messages.reduce((groups: Record<string, Message[]>, message) => {
    const otherUserId = message.senderId === user?.id ? message.recipientId : message.senderId;
    if (!groups[otherUserId]) {
      groups[otherUserId] = [];
    }
    groups[otherUserId].push(message);
    return groups;
  }, {});

  if (selectedAdmin) {
    return (
      <div className="min-h-screen bg-ios-bg dark:bg-gray-900" data-testid="conversation-screen">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="text-ios-blue dark:text-blue-400 text-lg p-0"
            data-testid="button-back"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <div className="text-center">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">{selectedAdmin.name}</h1>
            <p className="text-sm text-ios-text-secondary dark:text-gray-400">Administrator</p>
          </div>
          <Button
            onClick={() => setShowNewMessage(true)}
            className="bg-ios-blue hover:bg-ios-blue/90 text-white"
            size="sm"
            data-testid="button-new-message"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Conversation */}
        <div className="flex-1 p-4 space-y-4 pb-24">
          {conversation.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-ios-text-secondary dark:text-gray-400">No messages yet</p>
              <p className="text-sm text-ios-text-secondary dark:text-gray-400 mt-1">
                Start a conversation with the administrator
              </p>
            </div>
          ) : (
            conversation.map((message) => {
              const isFromMe = message.senderId === user?.id;
              return (
                <div
                  key={message.id}
                  className={`flex ${isFromMe ? 'justify-end' : 'justify-start'}`}
                  data-testid={`message-${message.id}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                      isFromMe
                        ? 'bg-ios-blue text-white'
                        : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600'
                    }`}
                  >
                    <div className="font-medium text-sm mb-1">{message.subject}</div>
                    <div className="text-sm">{message.content}</div>
                    <div
                      className={`text-xs mt-2 ${
                        isFromMe ? 'text-blue-100' : 'text-ios-text-secondary dark:text-gray-400'
                      }`}
                    >
                      {message.createdAt ? formatTime(message.createdAt) : 'Just now'}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* New Message Dialog */}
        <Dialog open={showNewMessage} onOpenChange={setShowNewMessage}>
          <DialogContent className="bg-white dark:bg-gray-800">
            <DialogHeader>
              <DialogTitle className="text-gray-900 dark:text-white">Send Message to {selectedAdmin.name}</DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-gray-300">
                Send a message to the school administrator
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Subject"
                value={newMessageSubject}
                onChange={(e) => setNewMessageSubject(e.target.value)}
                className="border-gray-200 dark:border-gray-600"
                data-testid="input-subject"
              />
              <Textarea
                placeholder="Type your message here..."
                value={newMessageContent}
                onChange={(e) => setNewMessageContent(e.target.value)}
                rows={4}
                className="border-gray-200 dark:border-gray-600"
                data-testid="textarea-message"
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowNewMessage(false)}
                className="text-gray-900 dark:text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSendMessage}
                disabled={sendMessageMutation.isPending}
                className="bg-ios-blue hover:bg-ios-blue/90 text-white"
                data-testid="button-send"
              >
                <Send className="w-4 h-4 mr-2" />
                {sendMessageMutation.isPending ? "Sending..." : "Send"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ios-bg dark:bg-gray-900" data-testid="messages-screen">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <Button
          variant="ghost"
          onClick={handleBack}
          className="text-ios-blue dark:text-blue-400 text-lg p-0"
          data-testid="button-back"
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Messages</h1>
        <div className="w-6"></div>
      </div>

      <div className="p-4">
        {/* Administrators Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-ios mb-4">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">School Administrators</h3>
            <p className="text-sm text-ios-text-secondary dark:text-gray-400">Send messages to school staff</p>
          </div>
          <div className="p-4 space-y-3">
            {admins.length === 0 ? (
              <div className="text-center py-8 text-ios-text-secondary dark:text-gray-400">
                <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No administrators available</p>
              </div>
            ) : (
              admins.map((admin) => {
                const adminMessages = groupedMessages[admin.id] || [];
                const lastMessage = adminMessages[adminMessages.length - 1];
                const unreadCount = adminMessages.filter(m => !m.isRead && m.senderId !== user?.id).length;

                return (
                  <div
                    key={admin.id}
                    onClick={() => setSelectedAdmin(admin)}
                    className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors card-hover"
                    data-testid={`admin-${admin.id}`}
                  >
                    <div className="w-12 h-12 bg-ios-blue rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {admin.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900 dark:text-white">{admin.name}</span>
                        {lastMessage && (
                          <span className="text-xs text-ios-text-secondary dark:text-gray-400">
                            {formatTime(lastMessage.createdAt || new Date())}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-ios-text-secondary dark:text-gray-400 truncate">
                          {lastMessage ? lastMessage.subject : 'No messages yet'}
                        </p>
                        {unreadCount > 0 && (
                          <div className="w-5 h-5 bg-ios-red rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">{unreadCount}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Messages */}
        {Object.keys(groupedMessages).length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-ios">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white">Recent Messages</h3>
            </div>
            <div className="p-4 space-y-3">
              {Object.entries(groupedMessages).slice(0, 5).map(([userId, userMessages]) => {
                const admin = admins.find(a => a.id === userId);
                const lastMessage = userMessages[userMessages.length - 1];
                
                if (!admin) return null;

                return (
                  <div
                    key={userId}
                    onClick={() => setSelectedAdmin(admin)}
                    className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    data-testid={`recent-message-${userId}`}
                  >
                    <div className="w-8 h-8 bg-ios-blue bg-opacity-20 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-ios-blue dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm text-gray-900 dark:text-white">{admin.name}</span>
                        <span className="text-xs text-ios-text-secondary dark:text-gray-400">
                          {formatTime(lastMessage.createdAt || new Date())}
                        </span>
                      </div>
                      <p className="text-sm text-ios-text-secondary dark:text-gray-400 truncate">
                        {lastMessage.subject}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}