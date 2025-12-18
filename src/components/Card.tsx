import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | string;
    hover?: boolean;
    interactive?: boolean;
    variant?: 'default' | 'glass' | 'outlined' | 'flat';
    fullHeight?: boolean;
}

const Card: React.FC<CardProps> = ({
    children,
    padding = 'lg',
    hover = false,
    interactive = false,
    variant = 'default',
    fullHeight = false,
    style,
    className = '',
    ...props
}) => {

    const getPadding = () => {
        switch (padding) {
            case 'none': return '0';
            case 'sm': return 'var(--space-3)';
            case 'md': return 'var(--space-4)';
            case 'lg': return 'var(--space-6)';
            case 'xl': return 'var(--space-8)';
            default: return padding; // Allow custom strings like "20px"
        }
    };

    const getVariantStyles = (): React.CSSProperties => {
        switch (variant) {
            case 'glass':
                return {
                    background: 'rgba(255, 255, 255, 0.7)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.5)',
                    boxShadow: 'var(--shadow-lg)',
                };
            case 'outlined':
                return {
                    background: 'var(--white)',
                    border: '1px solid var(--gray-200)',
                    boxShadow: 'none',
                };
            case 'flat':
                return {
                    background: 'var(--gray-50)',
                    border: 'none',
                    boxShadow: 'none',
                };
            case 'default':
            default:
                return {
                    background: 'var(--white)',
                    border: '1px solid var(--gray-100)',
                    boxShadow: 'var(--shadow-sm)',
                };
        }
    };

    const cardStyle: React.CSSProperties = {
        borderRadius: 'var(--radius-xl)',
        padding: getPadding(),
        overflow: 'hidden',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        cursor: interactive || props.onClick ? 'pointer' : 'default',
        height: fullHeight ? '100%' : 'auto',
        ...getVariantStyles(),
        ...style,
    };

    return (
        <div
            style={cardStyle}
            className={className}
            onMouseEnter={(e) => {
                if (hover || interactive || props.onClick) {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-xl)';
                }
                props.onMouseEnter?.(e);
            }}
            onMouseLeave={(e) => {
                if (hover || interactive || props.onClick) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = variant === 'glass' ? 'var(--shadow-lg)' : variant === 'flat' || variant === 'outlined' ? 'none' : 'var(--shadow-sm)';
                }
                props.onMouseLeave?.(e);
            }}
            {...props}
        >
            {children}
        </div>
    );
};

export default Card;
