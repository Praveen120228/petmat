import { useNavigate, useParams } from 'react-router-dom';
import { CaretLeft, Trash, Prohibit, UserCircle } from '@phosphor-icons/react';
import Card from '../components/Card';
import { getChats, deleteChat } from '../utils/storage';
import { useAuth } from '../context/AuthContext';

const ChatSettings = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const chatId = Number(id);
    const { user } = useAuth();

    // Safety check - should be protected route normally
    if (!user) return null;

    const chats = getChats(user.id);
    const chat = chats.find(c => c.id === chatId);

    if (!chat) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>Chat not found</div>;
    }

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this conversation? This cannot be undone.')) {
            deleteChat(user.id, chatId);
            navigate('/messages');
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', minHeight: '100vh', background: 'white' }}>

            {/* Header */}
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button onClick={() => navigate(-1)} style={{ color: '#1f2937', padding: '0.5rem', margin: '-0.5rem' }}>
                    <CaretLeft size={24} weight="bold" />
                </button>
                <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Chat Settings</h1>
            </div>

            <div style={{ padding: '2rem 1.5rem' }}>

                {/* User Info Card */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '3rem' }}>
                    <div style={{ width: '100px', height: '100px', borderRadius: '50%', overflow: 'hidden', marginBottom: '1rem', border: '4px solid #f9fafb' }}>
                        <img src={chat.avatar} alt={chat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827' }}>{chat.name}</h2>
                    <p style={{ color: '#6b7280', marginTop: '0.25rem' }}>Owner of {chat.petName}</p>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                    <Card style={{ padding: '0', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                        <div
                            style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'not-allowed', opacity: 0.5, borderBottom: '1px solid #f3f4f6' }}
                            title="Not implemented"
                        >
                            <Prohibit size={20} />
                            <span style={{ fontWeight: 500 }}>Block User</span>
                        </div>
                        <div
                            style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'not-allowed', opacity: 0.5 }}
                            title="Not implemented"
                        >
                            <UserCircle size={20} />
                            <span style={{ fontWeight: 500 }}>View Profile</span>
                        </div>
                    </Card>

                    <button
                        onClick={handleDelete}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            borderRadius: '12px',
                            background: '#fee2e2',
                            color: '#dc2626',
                            border: 'none',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            fontSize: '1rem',
                            transition: 'background 0.2s'
                        }}
                    >
                        <Trash size={20} weight="bold" />
                        Delete Conversation
                    </button>

                </div>

            </div>
        </div>
    );
};

export default ChatSettings;
