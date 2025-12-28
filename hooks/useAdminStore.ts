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
    slots: Slot[];
    games: Game[];
    historyBookings: any[];

    // New Data for Caching
    settings: any | null;
    subscriptionPlan: any | null;
    subscriptionHistory: any[];

    isLoading: boolean;

    // UI State
    activeSettingsTab: string;
    activeSubscriptionTab: string;
    setSettingsTab: (tab: string) => void;
    setSubscriptionTab: (tab: string) => void;

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

    // New Actions
    updateSettingsCache: (settings: any) => void;
    updateSubscriptionPlanCache: (plan: any) => void;
    refreshBookingStatuses: () => void;
}

export const useAdminStore = create<AdminState>((set) => ({
    stats: [],
    // ... (rest of initial state)
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

    settings: null,
    subscriptionPlan: null,
    subscriptionHistory: [],

    isLoading: true,

    // ...

    // UI State Init
    activeSettingsTab: "general",
    activeSubscriptionTab: "subscribers",
    setSettingsTab: (tab) => set({ activeSettingsTab: tab }),
    setSubscriptionTab: (tab) => set({ activeSubscriptionTab: tab }),

    setData: (data) => set((state) => ({ ...state, ...data, isLoading: false })),
    setLoading: (loading) => set({ isLoading: loading }),

    updateBookingStatus: (id, status, totalPrice, paymentMethod) => set((state) => {
        // Helper to update the specific booking in any list
        const updateList = (list: any[]) => list.map(b => b.id === id ? { ...b, status, totalPrice, paymentMethod } : b);

        let activeSlots = updateList(state.activeSlots);
        let finishedSlots = updateList(state.finishedSlots);
        let upcomingSlots = updateList(state.upcomingSlots);
        let recentBookings = updateList(state.recentBookings);
        let historyBookings = updateList(state.historyBookings);

        // If status is "Completed", move it to finishedSlots immediately
        if (status === "Completed") {
            const booking = activeSlots.find(b => b.id === id) || upcomingSlots.find(b => b.id === id) || finishedSlots.find(b => b.id === id);

            if (booking) {
                // Remove from active/upcoming
                activeSlots = activeSlots.filter(b => b.id !== id);
                upcomingSlots = upcomingSlots.filter(b => b.id !== id);

                // Handling Finished List:
                // If it's a "Collection" action (has price/method), it means we are settling the debt.
                // The user requested it be "removed from the list".
                if (totalPrice !== undefined && paymentMethod !== undefined) {
                    // Remove from finishedSlots if it was there (treating Finished list as "Pending Payment")
                    finishedSlots = finishedSlots.filter(b => b.id !== id);
                } else {
                    // Otherwise, if just completing without payment info yet (rare path for this logic?), ensure it's there
                    if (!finishedSlots.find(b => b.id === id)) {
                        finishedSlots = [{ ...booking, status, totalPrice, paymentMethod }, ...finishedSlots];
                    }
                }

                // Update Revenue
                if (totalPrice && totalPrice > 0 && !paymentMethod?.includes("SUBSCRIPTION")) {
                    const currentRevenue = parseFloat(state.totalRevenue.replace(/[^0-9.]/g, '')) || 0;
                    const newRevenue = currentRevenue + totalPrice;
                    // Format back to currency string
                    state.totalRevenue = `₹${newRevenue.toFixed(2)}`;
                }
            }
        }

        return {
            activeSlots,
            finishedSlots,
            upcomingSlots,
            recentBookings,
            historyBookings,
            activeBookings: activeSlots.length, // Check if we need to update count
            totalRevenue: state.totalRevenue
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

    addBooking: (booking) => set((state) => {
        const now = new Date();
        const startTime = new Date(booking.date);
        const endTime = new Date(booking.date);
        endTime.setMinutes(endTime.getMinutes() + booking.duration);

        if (startTime <= now && endTime > now) {
            return {
                activeSlots: [...state.activeSlots, booking],
                historyBookings: [booking, ...state.historyBookings],
            };
        } else if (endTime <= now) {
            return {
                finishedSlots: [...state.finishedSlots, booking],
                historyBookings: [booking, ...state.historyBookings],
            };
        } else {
            return {
                upcomingSlots: [...state.upcomingSlots, booking],
                historyBookings: [booking, ...state.historyBookings],
            };
        }
    }),

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

    updateSettingsCache: (settings) => set({ settings }),
    updateSubscriptionPlanCache: (plan) => set({ subscriptionPlan: plan }),

    refreshBookingStatuses: () => set((state) => {
        const now = new Date();
        const allBookings = [...state.activeSlots, ...state.upcomingSlots, ...state.finishedSlots];

        // Use a Map to deduplicate by ID in case of overlap during transitions
        const uniqueBookings = Array.from(new Map(allBookings.map(b => [b.id, b])).values());

        const activeSlots: any[] = [];
        const finishedSlots: any[] = [];
        const upcomingSlots: any[] = [];

        uniqueBookings.forEach(booking => {
            const startTime = new Date(booking.date);
            const endTime = new Date(booking.date);
            endTime.setMinutes(endTime.getMinutes() + booking.duration);

            if (booking.status === "Completed") {
                finishedSlots.push(booking);
            } else if (startTime <= now && endTime > now) {
                activeSlots.push(booking);
            } else if (endTime <= now) {
                finishedSlots.push(booking);
            } else {
                upcomingSlots.push(booking);
            }
        });

        // Only update if counts changed to verify efficiency? 
        // For now, just set new state to ensure UI reflects time changes immediately

        // REFACTOR: Stat Sync
        // We need to sync the stats array with the new list counts for the dashboard cards to update
        const updatedStats = state.stats.map(stat => {
            if (stat.label === "Upcoming Bookings") {
                return { ...stat, value: upcomingSlots.length };
            }
            if (stat.label === "Total Revenue") {
                return { ...stat, value: state.totalRevenue };
            }
            return stat;
        });

        return {
            activeSlots,
            finishedSlots,
            upcomingSlots,
            // Update summary stats if needed (active bookings count)
            activeBookings: activeSlots.length,
            stats: updatedStats
        };
    })
}));
