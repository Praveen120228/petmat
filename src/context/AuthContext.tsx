import { createContext, useContext, useState, type ReactNode } from 'react';

interface User {
    id: string;
    name: string;
    email: string;
    image?: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (email: string) => boolean;
    signup: (name: string, email: string) => boolean;
    updateUser: (data: Partial<User>) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    // Current Session
    const [user, setUser] = useState<User | null>(() => {
        const savedUser = localStorage.getItem('petmatch_user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    // Helper: Validates login against 'petmatch_users' DB
    const login = (email: string) => {
        const usersFn = localStorage.getItem('petmatch_users');
        const users: User[] = usersFn ? JSON.parse(usersFn) : [];

        const foundUser = users.find(u => u.email === email);

        if (foundUser) {
            setUser(foundUser);
            localStorage.setItem('petmatch_user', JSON.stringify(foundUser));
            return true;
        } else {
            alert('User not found. Please sign up first.');
            return false;
        }
    };

    // Helper: Registers new user
    const signup = (name: string, email: string) => {
        const usersFn = localStorage.getItem('petmatch_users');
        const users: User[] = usersFn ? JSON.parse(usersFn) : [];

        if (users.find(u => u.email === email)) {
            alert('Email already exists. Please login.');
            return false;
        }

        const newUser: User = {
            id: Date.now().toString(),
            name,
            email,
            image: ''
        };

        const updatedUsers = [...users, newUser];
        localStorage.setItem('petmatch_users', JSON.stringify(updatedUsers));

        // Auto-login
        setUser(newUser);
        localStorage.setItem('petmatch_user', JSON.stringify(newUser));
        return true;
    };

    const updateUser = (data: Partial<User>) => {
        if (!user) return;
        const updatedUser = { ...user, ...data };
        setUser(updatedUser);
        localStorage.setItem('petmatch_user', JSON.stringify(updatedUser)); // Update Session

        // Also update Main DB
        const usersFn = localStorage.getItem('petmatch_users');
        const users: User[] = usersFn ? JSON.parse(usersFn) : [];
        const updatedList = users.map(u => u.id === user.id ? updatedUser : u);
        localStorage.setItem('petmatch_users', JSON.stringify(updatedList));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('petmatch_user');
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, signup, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
