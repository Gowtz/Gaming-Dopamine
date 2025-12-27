import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Slot, User as PrismaUser, Booking, Game } from '@prisma/client';

// Flat Stat Type from Server Action
interface DashboardStat {
    label: string;
    value: string | number;
    desc: string;
    iconName: string;
}

interface User {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    role: string;
    isBlocked: boolean;
    membership?: any;
    bookings?: any[];
    [key: string]: any;
}

interface AdminState {
    stats: DashboardStat[];
    totalPlayers: number;
    activeBookings: number;
    totalRevenue: string;
    slotUtilization: number;

    // Lists
    activeSlots: any[];
    finishedSlots: any[];
    upcomingSlots: any[];
    recentBookings: any[];
    users: User[];
    slots: Slot[]; // Now containing ALL slots
    games: Game[]; // New
    historyBookings: any[]; // New

    isLoading: boolean;

    // Actions
    setData: (data: Partial<AdminState>) => void;
    setLoading: (loading: boolean) => void;
    updateBookingStatus: (id: string, status: string, totalPrice?: number, paymentMethod?: string) => void;
    updateBookingFields: (id: string, fields: Partial<any>) => void;
    deleteBooking: (id: string) => void;
    addBooking: (booking: any) => void;
    addSlot: (slot: Slot) => void;
    updateSlot: (id: string, data: Partial<Slot>) => void;
    addSlots: (slots: Slot[]) => void;
    deleteGame: (id: string) => void;
    addGame: (game: Game) => void;
    updateUser: (id: string, data: Partial<User>) => void;
}

export const useAdminStore = create<AdminState>((set) => ({
    stats: [],
    totalPlayers: 0,
    activeBookings: 0,
    totalRevenue: "₹0.00",
    slotUtilization: 0,

    activeSlots: [],
    finishedSlots: [],
    upcomingSlots: [],
    recentBookings: [],
    users: [],
    slots: [],
    games: [],
    historyBookings: [],

    isLoading: true,

    setData: (data) => set((state) => ({ ...state, ...data, isLoading: false })),
    setLoading: (loading) => set({ isLoading: loading }),

    updateBookingStatus: (id, status, totalPrice, paymentMethod) => set((state) => {
        const updateList = (list: any[]) => list.map(b => b.id === id ? { ...b, status, totalPrice, paymentMethod } : b);
        return {
            activeSlots: updateList(state.activeSlots),
            finishedSlots: updateList(state.finishedSlots),
            upcomingSlots: updateList(state.upcomingSlots),
            recentBookings: updateList(state.recentBookings),
            historyBookings: updateList(state.historyBookings),
        };
    }),

    updateBookingFields: (id, fields) => set((state) => {
        const updateList = (list: any[]) => list.map(b => b.id === id ? { ...b, ...fields } : b);
        return {
            activeSlots: updateList(state.activeSlots),
            finishedSlots: updateList(state.finishedSlots),
            upcomingSlots: updateList(state.upcomingSlots),
            recentBookings: updateList(state.recentBookings),
            historyBookings: updateList(state.historyBookings),
        };
    }),

    deleteBooking: (id) => set((state) => ({
        activeSlots: state.activeSlots.filter(b => b.id !== id),
        finishedSlots: state.finishedSlots.filter(b => b.id !== id),
        upcomingSlots: state.upcomingSlots.filter(b => b.id !== id),
        recentBookings: state.recentBookings.filter(b => b.id !== id),
        historyBookings: state.historyBookings.filter(b => b.id !== id),
    })),

    addBooking: (booking) => set((state) => ({
        upcomingSlots: [...state.upcomingSlots, booking],
        historyBookings: [booking, ...state.historyBookings],
        // Maybe update recent?
    })),

    addSlot: (slot) => set((state) => ({
        slots: [...state.slots, slot]
    })),

    updateSlot: (id, data) => set((state) => ({
        slots: state.slots.map(s => s.id === id ? { ...s, ...data } : s)
    })),

    deleteGame: (id) => set((state) => ({
        games: state.games.filter(g => g.id !== id)
    })),

    addGame: (game) => set((state) => ({
        games: [...state.games, game]
    })),

    updateUser: (id, data) => set((state) => ({
        users: state.users.map(u => u.id === id ? { ...u, ...data } : u)
    })),

    addSlots: (newSlots) => set((state) => ({
        slots: [...state.slots, ...newSlots]
    })),
}));
