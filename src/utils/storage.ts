import { MOCK_PETS } from '../data/mockPets';

// --- DATA KEYS ---
const ALL_PETS_KEY = 'petmatch_all_pets'; // Array of all user-created pets

// Helper to get scoped key
const scopedKey = (key: string, userId: string) => `${key}_${userId}`;

// --- PETS (Global + User) ---

export interface Pet {
    id: number;
    name: string;
    breed: string;
    age: string;
    gender: string;
    type: string;
    image?: string; // Keep for backward compatibility (primary image)
    images?: string[]; // New: Multiple images
    distance: string;
    owner: string; // Owner Name or ID
    ownerId: string; // Explicit Owner ID
    bio: string;
    traits: string[];
}

export const getAllPets = (): any[] => {
    // 1. Get Mock Pets
    const mockPets = [...MOCK_PETS];

    // 2. Get All User Pets (Global Registry)
    const storedPets = localStorage.getItem(ALL_PETS_KEY);
    const userPets = storedPets ? JSON.parse(storedPets) : [];

    return [...mockPets, ...userPets];
};

export const addUserPet = (pet: any, userId: string) => {
    // Actually we only want to append to the userPets list
    const storedPets = localStorage.getItem(ALL_PETS_KEY);
    const currentLocalPets = storedPets ? JSON.parse(storedPets) : [];

    const newPet = {
        ...pet,
        id: pet.id || Date.now(),
        ownerId: userId,
        type: pet.type || 'dog',
        distance: '1m',
        traits: pet.traits || ['Friendly']
    };

    localStorage.setItem(ALL_PETS_KEY, JSON.stringify([...currentLocalPets, newPet]));
    return newPet;
};

// --- LIKES ---
const LIKES_KEY = 'petmatch_likes';

export const getLikes = (userId: string): number[] => {
    const stored = localStorage.getItem(scopedKey(LIKES_KEY, userId));
    return stored ? JSON.parse(stored) : [];
};

export const toggleLike = (userId: string, petId: number): boolean => {
    const likes = getLikes(userId);
    const isLiked = likes.includes(petId);
    let newLikes;

    if (isLiked) {
        newLikes = likes.filter(id => id !== petId);
    } else {
        newLikes = [...likes, petId];
    }

    localStorage.setItem(scopedKey(LIKES_KEY, userId), JSON.stringify(newLikes));
    return !isLiked;
};

// --- MATCHES ---
const MATCHES_KEY = 'petmatch_matches';

export const getMatches = (userId: string): number[] => {
    const stored = localStorage.getItem(scopedKey(MATCHES_KEY, userId));
    return stored ? JSON.parse(stored) : [];
};

export const toggleMatch = (userId: string, petId: number): boolean => {
    const matches = getMatches(userId);
    const isMatched = matches.includes(petId);
    let newMatches;

    if (isMatched) {
        newMatches = matches.filter(id => id !== petId);
    } else {
        newMatches = [...matches, petId];
    }

    localStorage.setItem(scopedKey(MATCHES_KEY, userId), JSON.stringify(newMatches));
    return !isMatched;
};

// --- COLLECTIONS ---
const COLLECTIONS_KEY = 'petmatch_collections';

export interface Collection {
    id: string;
    name: string;
    petIds: number[];
}

export const getCollections = (userId: string): Collection[] => {
    const stored = localStorage.getItem(scopedKey(COLLECTIONS_KEY, userId));
    return stored ? JSON.parse(stored) : [];
};

export const createCollection = (userId: string, name: string): Collection => {
    const collections = getCollections(userId);
    const newCollection: Collection = {
        id: Date.now().toString(),
        name,
        petIds: []
    };
    localStorage.setItem(scopedKey(COLLECTIONS_KEY, userId), JSON.stringify([...collections, newCollection]));
    return newCollection;
};

export const addToCollection = (userId: string, collectionId: string, petId: number) => {
    const collections = getCollections(userId);
    const updated = collections.map(c => {
        if (c.id === collectionId && !c.petIds.includes(petId)) {
            return { ...c, petIds: [...c.petIds, petId] };
        }
        return c;
    });
    localStorage.setItem(scopedKey(COLLECTIONS_KEY, userId), JSON.stringify(updated));
};

export const removeFromCollection = (userId: string, collectionId: string, petId: number) => {
    const collections = getCollections(userId);
    const updated = collections.map(c => {
        if (c.id === collectionId) {
            return { ...c, petIds: c.petIds.filter(id => id !== petId) };
        }
        return c;
    });
    localStorage.setItem(scopedKey(COLLECTIONS_KEY, userId), JSON.stringify(updated));
};

export const deleteCollection = (userId: string, collectionId: string) => {
    const collections = getCollections(userId);
    const updated = collections.filter(c => c.id !== collectionId);
    localStorage.setItem(scopedKey(COLLECTIONS_KEY, userId), JSON.stringify(updated));
};

// --- CHATS ---
const CHATS_KEY = 'petmatch_chats';
const MESSAGES_KEY_PREFIX = 'petmatch_messages_';

export interface Chat {
    id: number;
    name: string; // Owner name
    petName: string;
    avatar: string;
    lastMessage: string;
    time: string;
    unread: number;
    // We could scope chats by adding ownerId but simplest is scoped key
}

export interface Message {
    id: number;
    text: string;
    sender: 'me' | 'them';
    time: string;
}

export const getChats = (userId: string): Chat[] => {
    const stored = localStorage.getItem(scopedKey(CHATS_KEY, userId));
    return stored ? JSON.parse(stored) : [];
};

export const createChat = (userId: string, ownerName: string, petName: string, petImage: string): number => {
    const chats = getChats(userId);
    const existing = chats.find(c => c.name === ownerName);
    if (existing) return existing.id;

    const newChat: Chat = {
        id: Date.now(),
        name: ownerName,
        petName: petName,
        avatar: petImage,
        lastMessage: 'Started a new conversation',
        time: 'Just now',
        unread: 0
    };

    localStorage.setItem(scopedKey(CHATS_KEY, userId), JSON.stringify([newChat, ...chats]));
    return newChat.id;
};

export const getMessages = (userId: string, chatId: number): Message[] => {
    // Messages key needs to be unique per user AND chat
    // Actually, chat IDs are unique timestamps (simplified). 
    // But if multiple users have chat ID 123... collisions.
    // However, chat ID is created by Date.now(). 
    // Safest: scopedKey(MESSAGES_KEY_PREFIX + chatId, userId)
    const stored = localStorage.getItem(scopedKey(MESSAGES_KEY_PREFIX + chatId, userId));
    return stored ? JSON.parse(stored) : [];
};

export const addMessage = (userId: string, chatId: number, text: string, sender: 'me' | 'them') => {
    const msgs = getMessages(userId, chatId);
    const newMsg: Message = {
        id: Date.now(),
        text,
        sender,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    localStorage.setItem(scopedKey(MESSAGES_KEY_PREFIX + chatId, userId), JSON.stringify([...msgs, newMsg]));

    // Update Chat List Preview
    const chats = getChats(userId);
    const chatIndex = chats.findIndex(c => c.id === chatId);
    if (chatIndex !== -1) {
        chats[chatIndex].lastMessage = text;
        chats[chatIndex].time = 'Just now';
        const updatedChat = chats.splice(chatIndex, 1)[0];
        localStorage.setItem(scopedKey(CHATS_KEY, userId), JSON.stringify([updatedChat, ...chats]));
    }

    return newMsg;
};

export const deleteChat = (userId: string, chatId: number) => {
    const chats = getChats(userId);
    const newChats = chats.filter(c => c.id !== chatId);
    localStorage.setItem(scopedKey(CHATS_KEY, userId), JSON.stringify(newChats));
    localStorage.removeItem(scopedKey(MESSAGES_KEY_PREFIX + chatId, userId));
};
