import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CaretLeft, PaperPlaneRight, DotsThreeVertical } from '@phosphor-icons/react';
import { getChats, getMessages, addMessage, type Message, type Chat } from '../utils/storage';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';

const ChatRoom = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { id } = useParams<{ id: string }>();
    const chatId = Number(id);
    const bottomRef = useRef<HTMLDivElement>(null);

    const [messages, setMessages] = useState<Message[]>([]);
    const [chatInfo, setChatInfo] = useState<Chat | null>(null);
    const [inputText, setInputText] = useState('');

    useEffect(() => {
        if (!chatId || !user) return;
        setMessages(getMessages(user.id, chatId));
        const chats = getChats(user.id);
        const chat = chats.find(c => c.id === chatId);
        if (chat) setChatInfo(chat);
    }, [chatId, user]);

    // Scroll to bottom
    const scrollToBottom = (behavior: 'auto' | 'smooth' = 'smooth') => {
        bottomRef.current?.scrollIntoView({ behavior });
    };

    useEffect(() => {
        scrollToBottom('auto');
    }, [chatInfo]);
    // Scroll on mount/chat switch immediately, messages update smooth

    useEffect(() => {
        scrollToBottom();
    }, [messages.length]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim() || !user) return;

        const newMsg = addMessage(user.id, chatId, inputText, 'me');
        setMessages(prev => [...prev, newMsg]);
        setInputText('');
    };

    if (!chatInfo) return (
        <div style={{ height: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'var(--gray-500)' }}>Loading chat...</span>
        </div>
    );

    return (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)', background: 'white' }}>

            {/* Header */}
            <div style={{
                padding: '1rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                borderBottom: '1px solid var(--gray-200)',
                background: 'rgba(255,255,255,0.8)',
                backdropFilter: 'blur(10px)',
                position: 'sticky',
                top: 0,
                zIndex: 10
            }}>
                <Button
                    variant="ghost"
                    onClick={() => navigate('/messages')}
                    style={{ padding: '0.5rem', borderRadius: '50%' }}
                >
                    <CaretLeft size={24} weight="bold" />
                </Button>

                <div
                    style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, cursor: 'pointer' }}
                    onClick={() => navigate(`/messages/${chatId}/info`)}
                >
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--gray-100)', overflow: 'hidden' }}>
                        <img src={chatInfo.avatar} alt={chatInfo.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.125rem', fontWeight: 700, lineHeight: 1.2 }}>{chatInfo.name}</h2>
                        <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>Owner of {chatInfo.petName}</p>
                    </div>
                </div>

                <Button variant="ghost" style={{ padding: '0.5rem', borderRadius: '50%' }}>
                    <DotsThreeVertical size={24} weight="regular" />
                </Button>
            </div>

            {/* Messages Area */}
            <div style={{
                flex: 1,
                padding: '2rem',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
                background: 'var(--gray-50)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '1rem', opacity: 0.6 }}>
                    <span style={{ fontSize: '0.8rem', background: 'var(--gray-200)', padding: '0.25rem 0.75rem', borderRadius: '100px', color: 'var(--gray-600)' }}>Today</span>
                </div>

                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        style={{
                            alignSelf: msg.sender === 'me' ? 'flex-end' : 'flex-start',
                            maxWidth: '75%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: msg.sender === 'me' ? 'flex-end' : 'flex-start'
                        }}
                    >
                        <div
                            style={{
                                padding: '1rem 1.25rem',
                                background: msg.sender === 'me'
                                    ? 'linear-gradient(135deg, var(--primary-600), var(--primary-500))'
                                    : 'white',
                                color: msg.sender === 'me' ? 'white' : 'var(--gray-800)',
                                borderRadius: msg.sender === 'me' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                                boxShadow: msg.sender === 'me' ? 'var(--shadow-colored)' : 'var(--shadow-sm)',
                                border: msg.sender === 'me' ? 'none' : '1px solid var(--gray-200)',
                                fontSize: '1rem',
                                lineHeight: 1.5
                            }}
                        >
                            {msg.text}
                        </div>
                        <span style={{
                            fontSize: '0.75rem',
                            color: 'var(--gray-400)',
                            marginTop: '0.5rem',
                            padding: '0 0.5rem'
                        }}>
                            {msg.time}
                        </span>
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>

            {/* Input Area */}
            <form
                onSubmit={handleSend}
                style={{
                    padding: '1.5rem',
                    background: 'white',
                    borderTop: '1px solid var(--gray-200)',
                    display: 'flex',
                    gap: '1rem',
                    alignItems: 'center'
                }}
            >
                <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type your message..."
                    style={{
                        flex: 1,
                        padding: '1rem 1.5rem',
                        borderRadius: 'var(--radius-full)',
                        border: '1px solid var(--gray-200)',
                        background: 'var(--gray-50)',
                        fontSize: '1rem',
                        outline: 'none',
                        transition: 'all 0.2s',
                        color: 'var(--gray-900)'
                    }}
                    onFocus={e => {
                        e.target.style.background = 'white';
                        e.target.style.borderColor = 'var(--primary-400)';
                        e.target.style.boxShadow = '0 0 0 4px var(--primary-50)';
                    }}
                    onBlur={e => {
                        e.target.style.background = 'var(--gray-50)';
                        e.target.style.borderColor = 'var(--gray-200)';
                        e.target.style.boxShadow = 'none';
                    }}
                />
                <Button
                    type="submit"
                    variant="primary"
                    disabled={!inputText.trim()}
                    style={{
                        padding: '1rem',
                        borderRadius: '50%',
                        width: '54px',
                        height: '54px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <PaperPlaneRight size={24} weight="fill" />
                </Button>
            </form>
        </div>
    );
};

export default ChatRoom;
