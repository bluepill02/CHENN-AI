export interface Message {
  id: number;
  sender: string;
  message: string;
  time: string;
  isMe?: boolean;
  deliveredAt?: string;
}

export interface Conversation {
  id: number;
  type: 'group' | 'announcement' | 'direct';
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  area?: string;
  pincode?: string;
  members?: number;
  isActive?: boolean;
  isOfficial?: boolean;
  verified?: boolean;
  language?: string;
  location?: string;
  tags?: string[];
  lastActiveAt?: string;
  sentiment?: 'positive' | 'neutral' | 'urgent';
}

const STORAGE_CONV_KEY = 'chennai_chat_conversations_v1';
const STORAGE_MSG_KEY = 'chennai_chat_messages_v1';

let inMemoryConversations: Conversation[] | null = null;
let inMemoryMessages: Record<number, Message[]> | null = null;

const defaultConversations: Conversation[] = [
  {
    id: 1,
    type: 'group',
    name: 'Mylapore Neighbors',
    lastMessage: 'Priya: Anyone knows good electrician nearby?',
    time: '2 min',
    unread: 3,
    members: 47,
    isActive: true,
    area: 'Mylapore',
    pincode: '600004',
    language: 'Tamil + English',
    verified: true,
    tags: ['Community', 'Help']
  },
  {
    id: 2,
    type: 'announcement',
    name: 'T. Nagar Updates',
    lastMessage: 'Water supply will be affected tomorrow 10 AM - 2 PM',
    time: '1 hour',
    unread: 0,
    isOfficial: true,
    verified: true,
    area: 'T. Nagar',
    pincode: '600017',
    tags: ['Utilities', 'Urgent'],
    sentiment: 'urgent'
  },
  {
    id: 3,
    type: 'direct',
    name: 'Rajesh Kumar',
    lastMessage: 'Thanks for the food recommendation! 🙏',
    time: '3 hours',
    unread: 0,
    location: 'Mylapore',
    area: 'Mylapore',
    pincode: '600004',
    language: 'Tamil',
    tags: ['Food', 'Neighbors']
  },
  {
    id: 4,
    type: 'group',
    name: 'Beach Cleanup Squad',
    lastMessage: 'Venkat: Meeting at 6 AM tomorrow at Marina',
    time: '5 hours',
    unread: 1,
    members: 23,
    isActive: true,
    area: 'Marina Beach',
    pincode: '600005',
    tags: ['Environment', 'Events']
  },
  {
    id: 5,
    type: 'announcement',
    name: 'Chennai Traffic Updates',
    lastMessage: 'Heavy traffic on OMR due to festival procession',
    time: '1 day',
    unread: 0,
    isOfficial: true,
    area: 'OMR Corridor',
    pincode: '600130',
    tags: ['Traffic', 'Daily']
  },
  {
    id: 6,
    type: 'direct',
    name: 'Divya Srinivasan',
    lastMessage: 'Carpool spot still available for tomorrow',
    time: '2 days',
    unread: 0,
    location: 'Adyar',
    area: 'Adyar',
    pincode: '600020',
    language: 'Tamil + English',
    tags: ['Commute'],
    sentiment: 'positive'
  },
  {
    id: 7,
    type: 'group',
    name: 'Anna Nagar Foodies',
    lastMessage: 'Meera: New filter coffee stall near Tower Park! ☕',
    time: '30 min',
    unread: 5,
    members: 102,
    isActive: true,
    area: 'Anna Nagar',
    pincode: '600040',
    tags: ['Food', 'Recommendations'],
    language: 'Tamil + English',
    sentiment: 'positive'
  }
];

const defaultMessages: Record<number, Message[]> = {
  1: [
    { id: 1, sender: 'Priya Akka', message: 'வணக்கம��� everyone! Does anyone know a good electrician nearby?', time: '10:30 AM', isMe: false },
    { id: 2, sender: 'Kumar Anna', message: 'Yes! Raman electrician near temple street. Very reliable, Tamil-speaking. Number: 9876543210', time: '10:32 AM', isMe: false },
    { id: 3, sender: 'Me', message: 'நன்றி Kumar Anna! I also need some electrical work done.', time: '10:35 AM', isMe: true },
    { id: 4, sender: 'Priya Akka', message: 'Perfect! Let\'s coordinate and get bulk discount 😊', time: '10:36 AM', isMe: false }
  ],
  4: [
    { id: 1, sender: 'Venkat Anna', message: 'Marina beach cleanup tomorrow 6 AM sharp! நம்ம சென்னை-ய clean-a வைப்போம்', time: '6:00 PM', isMe: false },
    { id: 2, sender: 'Lakshmi Akka', message: 'Count me in! எத்தனை பேரு வருவீங்க?', time: '6:02 PM', isMe: false },
    { id: 3, sender: 'Me', message: 'I will bring my family too. Any special instructions?', time: '6:05 PM', isMe: true },
    { id: 4, sender: 'Venkat Anna', message: 'Great! Bring water bottles. Gloves and bags will be provided. மீன் கூட்டம் avoid பண்ணுவோம்!', time: '6:07 PM', isMe: false }
  ]
};

function hasLocalStorage() {
  try {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  } catch (e) {
    return false;
  }
}

async function readConversations(): Promise<Conversation[]> {
  if (!hasLocalStorage()) {
    if (!inMemoryConversations) inMemoryConversations = defaultConversations.slice();
    return inMemoryConversations;
  }
  try {
    const raw = localStorage.getItem(STORAGE_CONV_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_CONV_KEY, JSON.stringify(defaultConversations));
      return defaultConversations.slice();
    }
    return JSON.parse(raw) as Conversation[];
  } catch (e) {
    console.error('ChatService: failed to read conversations', e);
    localStorage.setItem(STORAGE_CONV_KEY, JSON.stringify(defaultConversations));
    return defaultConversations.slice();
  }
}

async function writeConversations(items: Conversation[]) {
  if (!hasLocalStorage()) {
    inMemoryConversations = items;
    return;
  }
  localStorage.setItem(STORAGE_CONV_KEY, JSON.stringify(items));
}

async function readMessages(): Promise<Record<number, Message[]>> {
  if (!hasLocalStorage()) {
    if (!inMemoryMessages) inMemoryMessages = { ...defaultMessages };
    return inMemoryMessages;
  }
  try {
    const raw = localStorage.getItem(STORAGE_MSG_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_MSG_KEY, JSON.stringify(defaultMessages));
      return JSON.parse(JSON.stringify(defaultMessages));
    }
    return JSON.parse(raw) as Record<number, Message[]>;
  } catch (e) {
    console.error('ChatService: failed to read messages', e);
    localStorage.setItem(STORAGE_MSG_KEY, JSON.stringify(defaultMessages));
    return JSON.parse(JSON.stringify(defaultMessages));
  }
}

async function writeMessages(items: Record<number, Message[]>) {
  if (!hasLocalStorage()) {
    inMemoryMessages = items;
    return;
  }
  localStorage.setItem(STORAGE_MSG_KEY, JSON.stringify(items));
}

export async function getConversations(): Promise<Conversation[]> {
  return readConversations();
}

export async function getMessages(conversationId: number): Promise<Message[]> {
  const msgs = await readMessages();
  return msgs[conversationId] ? msgs[conversationId].slice() : [];
}

export async function sendMessage(conversationId: number, payload: { sender: string; message: string }) {
  const msgs = await readMessages();
  const convs = await readConversations();
  const nextId = Object.values(msgs).flat().reduce((max, m) => Math.max(max, m.id), 0) + 1;
  const now = new Date();
  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const newMsg: Message = {
    id: nextId,
    sender: payload.sender,
    message: payload.message,
    time,
    isMe: payload.sender === 'Me',
    deliveredAt: now.toISOString(),
  };
  msgs[conversationId] = msgs[conversationId] ? [...msgs[conversationId], newMsg] : [newMsg];
  await writeMessages(msgs);

  // update conversation lastMessage/time
  const idx = convs.findIndex(c => c.id === conversationId);
  if (idx !== -1) {
    const patch: Conversation = {
      ...convs[idx],
      lastMessage: `${payload.sender}: ${payload.message}`,
      time: 'Just now',
      lastActiveAt: now.toISOString(),
      unread: payload.sender === 'Me' ? 0 : convs[idx].unread + 1,
    };
    convs[idx] = patch;
    await writeConversations(convs);
  }

  return newMsg;
}

export async function createConversation(payload: Partial<Conversation> & { id?: number; name: string; type?: Conversation['type'] }) {
  const convs = await readConversations();
  const id = payload.id ?? (convs.reduce((max, c) => Math.max(max, c.id), 0) + 1);
  const newConv: Conversation = {
    id,
    type: payload.type ?? 'group',
    name: payload.name,
    lastMessage: payload.lastMessage ?? '',
    time: payload.time ?? 'Just now',
    unread: 0,
    members: payload.members ?? 1,
    isActive: payload.isActive ?? false,
    isOfficial: payload.isOfficial ?? false,
    location: payload.location ?? undefined
  };
  const next = [newConv, ...convs];
  await writeConversations(next);
  return newConv;
}

export async function getConversationById(conversationId: number): Promise<Conversation | null> {
  const convs = await readConversations();
  return convs.find(conv => conv.id === conversationId) ?? null;
}

export async function updateConversation(conversationId: number, patch: Partial<Conversation>) {
  const convs = await readConversations();
  const idx = convs.findIndex(conv => conv.id === conversationId);
  if (idx === -1) return;
  convs[idx] = { ...convs[idx], ...patch };
  await writeConversations(convs);
}

export async function replaceConversations(items: Conversation[]) {
  await writeConversations(items);
}

export async function saveMessages(conversationId: number, messages: Message[]) {
  const allMessages = await readMessages();
  allMessages[conversationId] = [...messages];
  await writeMessages(allMessages);
}

export async function persistMessage(
  conversationId: number,
  message: Message,
  conversationPatch?: Partial<Conversation>
) {
  const allMessages = await readMessages();
  const list = allMessages[conversationId] ? [...allMessages[conversationId]] : [];
  const index = list.findIndex(existing => existing.id === message.id);
  if (index >= 0) {
    list[index] = { ...list[index], ...message };
  } else {
    list.push(message);
  }
  allMessages[conversationId] = list;
  await writeMessages(allMessages);

  if (conversationPatch) {
    await updateConversation(conversationId, conversationPatch);
  }
}

export default {
  getConversations,
  getMessages,
  sendMessage,
  createConversation,
  getConversationById,
  updateConversation,
  replaceConversations,
  saveMessages,
  persistMessage
};
