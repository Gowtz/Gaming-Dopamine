"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Gamepad2, Glasses, CarFront, ChevronRight, CheckCircle2, AlertCircle, Loader2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { getAvailableSlots, createOnlineBooking } from "@/lib/actions/booking-actions";
import { toast } from "sonner";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

const PLATFORMS = [
    {
        id: "PS5",
        title: "PlayStation 5",
        icon: Gamepad2,
        color: "text-blue-500",
        bg: "bg-blue-500/10",
        border: "border-blue-500/20"
    },
    {
        id: "VR",
        title: "VR Experience",
        icon: Glasses,
        color: "text-purple-500",
        bg: "bg-purple-500/10",
        border: "border-purple-500/20"
    },
    {
        id: "RACING_SIM",
        title: "Racing Simulator",
        icon: CarFront,
        color: "text-red-500",
        bg: "bg-red-500/10",
        border: "border-red-500/20"
    }
];

export function BookingModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState(1);
    const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [slots, setSlots] = useState<any[]>([]);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [bookingStatus, setBookingStatus] = useState<'idle' | 'success' | 'error'>('idle');

    // Fetch slots when Date or Platform changes
    useEffect(() => {
        if (step === 2 && selectedPlatform && date) {
            const fetchSlots = async () => {
                setLoading(true);
                const data = await getAvailableSlots(date, selectedPlatform);
                setSlots(data);
                setLoading(false);
            };
            fetchSlots();
        }
    }, [step, selectedPlatform, date]);

    const handleConfirmBooking = async () => {
        if (!selectedTime || !date || !selectedPlatform) return;
        setLoading(true);
        try {
            const result = await createOnlineBooking(selectedPlatform, date, selectedTime);
            if (result.success) {
                setBookingStatus('success');
                setTimeout(() => {
                    setIsOpen(false);
                    // Reset form
                    setStep(1);
                    setSelectedPlatform(null);
                    setSelectedTime(null);
                    setBookingStatus('idle');
                }, 2000);
            } else {
                setBookingStatus('error');
            }
        } catch (error) {
            setBookingStatus('error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 h-12 md:h-14 rounded-xl font-bold text-base md:text-lg transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/20">
                    Book Now
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl p-0 bg-black/90 border-zinc-800 backdrop-blur-xl gap-0 overflow-hidden">
                <div className="flex h-[600px] flex-col md:flex-row">

                    {/* Sidebar / Progress */}
                    <div className="w-full md:w-64 bg-zinc-900/50 p-6 flex flex-col justify-between border-b md:border-r border-zinc-800">
                        <div>
                            <DialogHeader>
                                <DialogTitle className="text-xl font-bold text-white mb-2">New Booking</DialogTitle>
                                <DialogDescription>Reserve your gaming session.</DialogDescription>
                            </DialogHeader>

                            <div className="mt-8 space-y-6">
                                <div className={cn("flex items-center gap-3 transition-colors", step >= 1 ? "text-white" : "text-zinc-500")}>
                                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border", step >= 1 ? "border-blue-500 bg-blue-500 text-white" : "border-zinc-700 bg-zinc-800")}>1</div>
                                    <span className="font-medium">Experience</span>
                                </div>
                                <div className={cn("flex items-center gap-3 transition-colors", step >= 2 ? "text-white" : "text-zinc-500")}>
                                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border", step >= 2 ? "border-blue-500 bg-blue-500 text-white" : "border-zinc-700 bg-zinc-800")}>2</div>
                                    <span className="font-medium">Date & Time</span>
                                </div>
                                <div className={cn("flex items-center gap-3 transition-colors", step >= 3 ? "text-white" : "text-zinc-500")}>
                                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border", step >= 3 ? "border-blue-500 bg-blue-500 text-white" : "border-zinc-700 bg-zinc-800")}>3</div>
                                    <span className="font-medium">Confirm</span>
                                </div>
                            </div>
                        </div>

                        {/* Summary */}
                        {selectedPlatform && (
                            <div className="mt-auto hidden md:block pt-6 border-t border-zinc-800">
                                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Selected</p>
                                <p className="font-bold text-white flex items-center gap-2">
                                    {PLATFORMS.find(p => p.id === selectedPlatform)?.title}
                                </p>
                                {date && <p className="text-sm text-zinc-400 mt-1">{format(date, "MMM dd, yyyy")}</p>}
                            </div>
                        )}
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 p-6 md:p-8 overflow-hidden flex flex-col">

                        {/* Step 1: Platform Selection */}
                        {step === 1 && (
                            <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
                                <h2 className="text-2xl font-bold text-white mb-6">Choose Experience</h2>
                                <div className="grid grid-cols-1 gap-4 overflow-y-auto">
                                    {PLATFORMS.map((platform) => (
                                        <button
                                            key={platform.id}
                                            onClick={() => { setSelectedPlatform(platform.id); setStep(2); }}
                                            className={cn(
                                                "relative group flex items-center gap-4 p-4 rounded-2xl border transition-all text-left",
                                                "hover:bg-zinc-800/50 hover:border-zinc-700",
                                                platform.bg,
                                                platform.border
                                            )}
                                        >
                                            <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center bg-black/20", platform.color)}>
                                                <platform.icon className="w-7 h-7" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-white">{platform.title}</h3>
                                                <p className="text-sm text-zinc-400">Available for booking</p>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-zinc-600 ml-auto group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Step 2: Date & Slots */}
                        {step === 2 && (
                            <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-white">Select Date & Time</h2>
                                    <button onClick={() => setStep(1)} className="text-zinc-500 hover:text-white text-sm flex items-center gap-1 transition-colors">
                                        &larr; Back to Experiences
                                    </button>
                                </div>

                                <div className="flex flex-col md:flex-row gap-8 h-full overflow-hidden">
                                    {/* Calendar */}
                                    <div className="shrink-0 flex justify-center md:block">
                                        <Calendar
                                            mode="single"
                                            selected={date}
                                            onSelect={setDate}
                                            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                            className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-3 pointer-events-auto"
                                        />
                                    </div>

                                    {/* Slots Grid */}
                                    <div className="flex-1 flex flex-col min-h-0 bg-zinc-900/20 rounded-2xl border border-zinc-800/50 overflow-hidden">
                                        <div className="p-4 border-b border-zinc-800/50 flex items-center justify-between bg-zinc-900/40">
                                            <h3 className="font-bold text-white flex items-center gap-2">
                                                Available Times
                                            </h3>
                                            {loading && <Loader2 className="w-4 h-4 animate-spin text-zinc-500" />}
                                        </div>

                                        <ScrollArea className="flex-1 p-4">
                                            {!loading && slots.length === 0 ? (
                                                <div className="flex flex-col items-center justify-center h-48 text-center px-4">
                                                    <div className="w-12 h-12 rounded-full bg-zinc-800/50 flex items-center justify-center mb-3">
                                                        <Clock className="w-6 h-6 text-zinc-600" />
                                                    </div>
                                                    <p className="text-zinc-400 font-medium">No slots available</p>
                                                    <p className="text-zinc-600 text-sm mt-1">Please try selecting another date.</p>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                                                    {slots.map((slot) => {
                                                        const [sH, sM] = slot.startTime.split(':');
                                                        const [eH, eM] = slot.endTime.split(':');
                                                        const startTimeSimple = parseInt(sM) === 0 ? parseInt(sH) : `${sH}:${sM}`;
                                                        const endTimeSimple = parseInt(eM) === 0 ? parseInt(eH) : `${eH}:${eM}`;

                                                        return (
                                                            <button
                                                                key={slot.startTime}
                                                                disabled={slot.isFull}
                                                                onClick={() => { setSelectedTime(slot.startTime); setStep(3); }}
                                                                className={cn(
                                                                    "flex flex-col items-center justify-center p-2 rounded-xl border transition-all relative group h-20",
                                                                    slot.isFull
                                                                        ? "opacity-50 cursor-not-allowed bg-zinc-900 border-zinc-800"
                                                                        : selectedTime === slot.startTime
                                                                            ? "bg-blue-600 border-blue-500 shadow-lg shadow-blue-500/20"
                                                                            : "bg-zinc-900/50 border-zinc-700 hover:bg-zinc-800 hover:border-zinc-500"
                                                                )}
                                                            >
                                                                <span className={cn(
                                                                    "font-bold text-lg",
                                                                    selectedTime === slot.startTime ? "text-white" : "text-white"
                                                                )}>
                                                                    {startTimeSimple}-{endTimeSimple}
                                                                </span>

                                                                {slot.isFull && (
                                                                    <span className="text-[10px] text-red-500 font-medium mt-1">Full</span>
                                                                )}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </ScrollArea>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Confirmation */}
                        {step === 3 && (
                            <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300 justify-center items-center text-center">
                                {bookingStatus === 'success' ? (
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center animate-bounce">
                                            <CheckCircle2 className="w-10 h-10 text-green-500" />
                                        </div>
                                        <h2 className="text-3xl font-bold text-white">Booking Confirmed!</h2>
                                        <p className="text-zinc-400">Your session has been reserved.</p>
                                    </div>
                                ) : bookingStatus === 'error' ? (
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center">
                                            <AlertCircle className="w-10 h-10 text-red-500" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-white">Booking Failed</h2>
                                        <p className="text-zinc-400">Something went wrong. Please try again.</p>
                                        <Button onClick={() => setBookingStatus('idle')} variant="outline" className="mt-4">Try Again</Button>
                                    </div>
                                ) : (
                                    <div className="w-full max-w-md space-y-8">
                                        <h2 className="text-2xl font-bold text-white">Confirm Booking</h2>

                                        <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800 space-y-4 text-left">
                                            <div className="flex justify-between">
                                                <span className="text-zinc-400">Experience</span>
                                                <span className="font-bold text-white">{PLATFORMS.find(p => p.id === selectedPlatform)?.title}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-zinc-400">Date</span>
                                                <span className="font-bold text-white">{format(date!, "MMMM dd, yyyy")}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-zinc-400">Time</span>
                                                <span className="font-bold text-white">
                                                    {slots.find(s => s.startTime === selectedTime)?.startTime} - {slots.find(s => s.startTime === selectedTime)?.endTime}
                                                </span>
                                            </div>
                                            <div className="border-t border-zinc-800 pt-4 flex justify-between">
                                                <span className="text-zinc-400">Price</span>
                                                <span className="font-bold text-blue-400 text-lg">₹{slots.find(s => s.startTime === selectedTime)?.price}</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <Button variant="outline" onClick={() => setStep(2)} className="h-12 rounded-xl">
                                                Back
                                            </Button>
                                            <Button
                                                onClick={handleConfirmBooking}
                                                className="h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
                                                disabled={loading}
                                            >
                                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirm & Book"}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
