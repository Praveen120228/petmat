import { useState, useRef, useEffect, useMemo } from 'react';
import { CaretDown, MagnifyingGlass, Check } from '@phosphor-icons/react';

interface SearchableSelectProps {
    options: string[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    label?: string;
}

const SearchableSelect = ({ options, value, onChange, placeholder = "Select...", label }: SearchableSelectProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Filter options
    const filteredOptions = useMemo(() => {
        if (!search) return options;
        return options.filter(opt => opt.toLowerCase().includes(search.toLowerCase()));
    }, [options, search]);

    // Handle outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Focus input when opened
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
        if (!isOpen) {
            setSearch(''); // Reset search on close
        }
    }, [isOpen]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', width: '100%' }}>
            {label && (
                <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginLeft: '0.25rem' }}>
                    {label}
                </label>
            )}
            <div ref={wrapperRef} style={{ position: 'relative' }}>
                {/* Trigger Button */}
                <div
                    onClick={() => setIsOpen(!isOpen)}
                    style={{
                        padding: '0.75rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        border: `1px solid ${isOpen ? 'var(--primary-600)' : 'var(--color-border)'}`,
                        background: 'var(--color-bg-subtle)',
                        color: value ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'all 0.2s',
                        boxShadow: isOpen ? '0 0 0 2px var(--primary-100)' : 'none'
                    }}
                >
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {value || placeholder}
                    </span>
                    <CaretDown size={16} weight="bold" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                </div>

                {/* Dropdown Menu */}
                {isOpen && (
                    <div style={{
                        position: 'absolute',
                        top: '120%',
                        left: 0,
                        right: 0,
                        background: 'var(--color-bg-card)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-lg)',
                        padding: '0.5rem',
                        boxShadow: 'var(--shadow-xl)',
                        zIndex: 50,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                        animation: 'fadeIn 0.1s ease-out'
                    }}>
                        {/* Search Input */}
                        <div style={{ position: 'relative', padding: '0.25rem' }}>
                            <MagnifyingGlass size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder="Search..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                    width: '100%',
                                    padding: '0.5rem 0.5rem 0.5rem 2.25rem',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--color-border)',
                                    background: 'var(--color-bg-app)',
                                    color: 'var(--color-text-primary)',
                                    fontSize: '0.875rem',
                                    outline: 'none'
                                }}
                            />
                        </div>

                        {/* Options List */}
                        <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map(opt => (
                                    <div
                                        key={opt}
                                        onClick={() => {
                                            onChange(opt);
                                            setIsOpen(false);
                                        }}
                                        style={{
                                            padding: '0.5rem 0.75rem',
                                            borderRadius: 'var(--radius-md)',
                                            cursor: 'pointer',
                                            color: value === opt ? 'var(--primary-600)' : 'var(--color-text-primary)',
                                            background: value === opt ? 'var(--primary-50)' : 'transparent',
                                            fontSize: '0.9rem',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            transition: 'background 0.1s'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (value !== opt) e.currentTarget.style.background = 'var(--color-bg-subtle)';
                                        }}
                                        onMouseLeave={(e) => {
                                            if (value !== opt) e.currentTarget.style.background = 'transparent';
                                        }}
                                    >
                                        {opt}
                                        {value === opt && <Check weight="bold" />}
                                    </div>
                                ))
                            ) : (
                                <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
                                    No results found
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchableSelect;
