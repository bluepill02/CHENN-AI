import React, { useState, useEffect } from 'react';
import { useAuth } from './auth/SupabaseAuthProvider';
import { useLanguage } from '../services/LanguageService';
import { ChatService, Message } from '../services/ChatService';
import { toast } from 'sonner';
import { Users, MessageCircle, Megaphone, Keyboard, Loader2, Send } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { TamilKeyboard } from './TamilKeyboard';
import { LanguageToggle } from './LanguageToggle';
import { ChatMessageSkeleton } from './SkeletonLoaders';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';

export function ChatScreen() {
  const { user } = useAuth();
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [showTamilKeyboard, setShowTamilKeyboard] = useState(false);
  const { t } = useLanguage();

  // Conversations State
  const [conversations, setConversations] = useState<any[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);

  // Create Group State
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [creatingGroup, setCreatingGroup] = useState(false);

  // Fetch conversations on mount
  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  // Fetch messages when chat is selected
  useEffect(() => {
    if (selectedChat) {
      loadMessages(selectedChat.id);

      // Subscribe to new messages (mock for now, real-time later)
      const interval = setInterval(() => {
        loadMessages(selectedChat.id, true);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [selectedChat]);

  const loadConversations = async () => {
    if (!user) return;
    setLoadingConversations(true);
    try {
      const data = await ChatService.getConversations(user.id);
      setConversations(data);
    } catch (error) {
      console.error('Failed to load conversations', error);
      toast.error('Failed to load chats');
    } finally {
      setLoadingConversations(false);
    }
  };

  const loadMessages = async (chatId: string, silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await ChatService.getMessages(chatId);
      setMessages(data);
    } catch (error) {
      console.error('Failed to load messages', error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !selectedChat) return;
    setSending(true);
    try {
      await ChatService.sendMessage(selectedChat.id, user.id, newMessage.trim());
      setNewMessage('');
      loadMessages(selectedChat.id, true);
    } catch (error) {
      console.error('Failed to send message', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!user || !newGroupName.trim()) return;

    setCreatingGroup(true);
    try {
      await ChatService.createGroup(newGroupName, newGroupDesc, user.id, true); // Defaulting to public for community groups
      toast.success('Group created successfully!');
      setIsCreateGroupOpen(false);
      setNewGroupName('');
      setNewGroupDesc('');
      loadConversations();
    } catch (error) {
      console.error('Failed to create group', error);
      toast.error('Failed to create group');
    } finally {
      setCreatingGroup(false);
    }
  };

  const getConversationIcon = (conversation: any) => {
    if (conversation.is_group) {
      return <Users className="w-10 h-10 text-orange-500 bg-orange-100 p-2 rounded-full" />;
    }
    return (
      <Avatar className="w-10 h-10 border-2 border-white shadow-sm">
        <AvatarImage src={conversation.avatar_url} />
        <AvatarFallback>{conversation.name?.[0]}</AvatarFallback>
      </Avatar>
    );
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Join Group State
  const [isJoinGroupOpen, setIsJoinGroupOpen] = useState(false);
  const [publicGroups, setPublicGroups] = useState<any[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [groupSearchQuery, setGroupSearchQuery] = useState('');

  const fetchPublicGroups = async () => {
    setLoadingGroups(true);
    try {
      const groups = await ChatService.getPublicGroups();
      setPublicGroups(groups);
    } catch (error) {
      console.error('Failed to load public groups', error);
      toast.error('Failed to load groups');
    } finally {
      setLoadingGroups(false);
    }
  };

  const handleJoinGroup = async (group: any) => {
    if (!user) return;
    try {
      await ChatService.joinGroup(group.id, user.id);
      toast.success(`Joined ${group.name}!`);
      setIsJoinGroupOpen(false);
      loadConversations(); // Refresh chat list
    } catch (error) {
      console.error('Failed to join group', error);
      toast.error('Failed to join group');
    }
  };

  const filteredPublicGroups = publicGroups.filter(g =>
    g.name.toLowerCase().includes(groupSearchQuery.toLowerCase()) ||
    (g.description && g.description.toLowerCase().includes(groupSearchQuery.toLowerCase()))
  );

  const quickActions = [
    {
      icon: Users,
      label: 'Join Groups',
      color: 'text-blue-600 bg-blue-100',
      action: () => {
        setIsJoinGroupOpen(true);
        fetchPublicGroups();
      }
    },
    {
      icon: MessageCircle,
      label: 'Start Chat',
      color: 'text-green-600 bg-green-100',
      action: () => toast.info('User search coming soon!')
    },
    {
      icon: Megaphone,
      label: 'Create Group',
      color: 'text-red-600 bg-red-100',
      action: () => setIsCreateGroupOpen(true)
    }
  ];

  // ... (rest of the component)

  return (
    <div className="bg-gradient-to-b from-orange-50 to-yellow-25 min-h-screen relative">
      {/* ... (existing background) */}
      <div className="fixed inset-0 opacity-15 md:opacity-10 pointer-events-none">
        <img
          src="/assets/bg_community.png"
          alt="Chennai Chat Conversations"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-400 to-orange-500 px-6 py-6 rounded-b-[2rem]">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-white text-2xl font-display font-bold">{t('chat.title', 'Chat')}</h1>
            <LanguageToggle />
          </div>
          <p className="text-orange-100">{t('chat.subtitle', 'Stay connected with your community')}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-yellow-200 text-xs">💬 {t('chat.keyboard', 'Tamil keyboard supported')}</span>
          </div>
        </div>

        {/* Quick actions */}
        <div className="px-6 py-4">
          <div className="flex gap-3">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="flex-1 h-auto p-3 flex-col gap-2 border-orange-200 hover:bg-orange-50"
                onClick={action.action}
              >
                <action.icon className={`w-6 h-6 ${action.color.split(' ')[0]}`} />
                <span className="text-xs text-gray-600">{action.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Conversations list */}
        <div className="px-6 pb-20">
          <div className="space-y-2">
            {loadingConversations ? (
              <div className="text-center py-8 text-gray-500">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-orange-400" />
                <p>Loading chats...</p>
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-10 bg-white/50 rounded-xl border border-dashed border-gray-300">
                <p className="text-gray-500 mb-2">No conversations yet.</p>
                <Button variant="link" onClick={() => setIsCreateGroupOpen(true)} className="text-orange-600">
                  Create a Group
                </Button>
              </div>
            ) : (
              conversations.map((conversation) => (
                <Card
                  key={conversation.id}
                  className="p-4 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(234,88,12,1)] hover:shadow-[6px_6px_0px_0px_rgba(234,88,12,1)] transition-all cursor-pointer hover:scale-[1.02] relative overflow-hidden group"
                  onClick={() => setSelectedChat(conversation)}
                >
                  <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-multiply z-0" style={{ backgroundImage: 'url("/assets/noise.png")', backgroundRepeat: 'repeat' }}></div>
                  <div className="relative z-10 flex items-center gap-3">
                    {/* Avatar/Icon */}
                    <div className="relative">
                      {getConversationIcon(conversation)}
                      {conversation.isActive && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>

                    {/* Conversation details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-gray-900 truncate">{conversation.name || 'Unnamed Chat'}</h3>
                          {conversation.is_public && (
                            <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs">
                              Public
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-gray-500 flex-shrink-0">
                          {conversation.time ? formatTime(conversation.time) : ''}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 truncate mb-1">{conversation.lastMessage}</p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {/* Members count if available */}
                        </div>

                        {conversation.unread > 0 && (
                          <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                            <span className="text-xs text-white">{conversation.unread}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Join Group Dialog */}
      <Dialog open={isJoinGroupOpen} onOpenChange={setIsJoinGroupOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Join Community Groups</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <Input
              placeholder="Search groups (e.g. Anna Nagar)"
              value={groupSearchQuery}
              onChange={(e) => setGroupSearchQuery(e.target.value)}
            />

            {loadingGroups ? (
              <div className="text-center py-8">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-orange-500" />
              </div>
            ) : filteredPublicGroups.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No public groups found.
              </div>
            ) : (
              <div className="space-y-2">
                {filteredPublicGroups.map(group => (
                  <div key={group.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <h4 className="font-bold text-sm">{group.name}</h4>
                      <p className="text-xs text-gray-500">{group.description}</p>
                    </div>
                    <Button size="sm" onClick={() => handleJoinGroup(group)} className="bg-orange-500 text-white">
                      Join
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Group Dialog */}
      <Dialog open={isCreateGroupOpen} onOpenChange={setIsCreateGroupOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Group</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Group Name</Label>
              <Input id="name" value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} placeholder="e.g. Mylapore Runners" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="desc">Description</Label>
              <Textarea id="desc" value={newGroupDesc} onChange={(e) => setNewGroupDesc(e.target.value)} placeholder="What's this group about?" />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCreateGroup} disabled={creatingGroup} className="bg-orange-500 hover:bg-orange-600 text-white">
              {creatingGroup ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Group'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}