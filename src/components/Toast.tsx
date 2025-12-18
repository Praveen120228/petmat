import React, { useEffect } from 'react';
import { X, CheckCircle, WarningCircle, Info } from '@phosphor-icons/react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
    id: string;
    message: string;
    type: ToastType;
    onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ id, message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => onClose(id), 5000); // Auto close after 5s
        return () => clearTimeout(timer);
    }, [id, onClose]);

    const icons = {
        success: <CheckCircle weight="fill" color="var(--success)" size={24} />,
        error: <WarningCircle weight="fill" color="var(--error)" size={24} />,
        info: <Info weight="fill" color="var(--primary-600)" size={24} />
    };

    return (
        <div style={{
            display: 'flex',
            alignItems: 'start',
            gap: '12px',
            background: 'white',
            padding: '16px',
            borderRadius: '16px',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--gray-100)',
            width: '320px',
            pointerEvents: 'auto',
            animation: 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <div style={{ flexShrink: 0, marginTop: '2px' }}>
                {icons[type]}
            </div>
            <div style={{ flex: 1 }}>
                <p style={{
                    margin: 0,
                    fontSize: '0.95rem',
                    color: 'var(--gray-800)',
                    fontWeight: 600,
                    lineHeight: 1.4
                }}>
                    {type === 'success' ? 'Success' : type === 'error' ? 'Error' : 'Notification'}
                </p>
                <p style={{
                    margin: '4px 0 0 0',
                    fontSize: '0.875rem',
                    color: 'var(--gray-500)',
                    lineHeight: 1.5
                }}>
                    {message}
                </p>
            </div>
            <button
                onClick={() => onClose(id)}
                style={{
                    color: 'var(--gray-400)',
                    padding: '4px',
                    margin: '-4px -4px 0 0',
                    cursor: 'pointer',
                    borderRadius: '50%',
                    transition: 'background 0.2s',
                    flexShrink: 0
                }}
                onMouseEnter={e => {
                    e.currentTarget.style.background = 'var(--gray-100)';
                    e.currentTarget.style.color = 'var(--gray-600)';
                }}
                onMouseLeave={e => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--gray-400)';
                }}
            >
                <X size={16} weight="bold" />
            </button>
            <style>{`
                @keyframes slideIn {
                    from { opacity: 0; transform: translateX(20px) scale(0.95); }
                    to { opacity: 1; transform: translateX(0) scale(1); }
                }
            `}</style>
        </div>
    );
};

export default Toast;
