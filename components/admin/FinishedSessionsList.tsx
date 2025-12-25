"use client";

import { useState } from "react";
import { CheckCircle2, DollarSign, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { updateBookingStatus } from "@/lib/actions/admin-actions";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

interface FinishedSlot {
    id: string;
    date: Date;
    duration: number;
    user?: {
        id: string;
        name: string | null;
        email: string | null;
        image: string | null;
        membership?: {
            isSubscriber: boolean;
            totalHours: number;
            utilizedHours: number;
        } | null;
    } | null;
    slot?: {
        price: number;
        title: string | null | undefined;
    } | null;
    source: string;
}

interface FinishedSessionsListProps {
    slots: FinishedSlot[]; // Using partial type for flexibility
}

export function FinishedSessionsList({ slots }: FinishedSessionsListProps) {
    const router = useRouter();
    const [confirming, setConfirming] = useState<string | null>(null);
    const [paymentModal, setPaymentModal] = useState<{
        slot: FinishedSlot;
        amount: number;
    } | null>(null);

    // Calculate dynamic pricing
    const getSessionCost = (duration: number, slotPrice?: number) => {
        const pricePerHour = slotPrice || 100;
        return Math.ceil((duration / 60) * pricePerHour);
    };

    const handleComplete = async (bookingId: string) => {
        setConfirming(bookingId);
        try {
            await updateBookingStatus(bookingId, "Completed");
            setPaymentModal(null);
            router.refresh();
        } catch (error) {
            console.error("Failed to complete session:", error);
            alert("Failed to close session");
        } finally {
            setConfirming(null);
        }
    };

    if (slots.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-6 text-muted-foreground text-sm">
                <p>No finished sessions pending checkout.</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {slots.map((slot) => {
                const isSubscriber = slot.user?.membership?.isSubscriber;
                const cost = getSessionCost(slot.duration, slot.slot?.price);

                return (
                    <div
                        key={slot.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-red-200 bg-background shadow-sm"
                    >
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                                <DollarSign className="h-5 w-5 text-red-600" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm">
                                    {slot.user?.name || "Guest Player"}
                                    {isSubscriber && <Badge variant="secondary" className="ml-2 text-[10px] bg-purple-100 text-purple-700">Subscriber</Badge>}
                                </h4>
                                <p className="text-xs text-muted-foreground">
                                    {slot.duration}m Session • Ended
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {isSubscriber ? (
                                <div className="text-right mr-2">
                                    <div className="text-sm font-bold text-purple-600">
                                        -{slot.duration / 60}h
                                    </div>
                                    <div className="text-[10px] text-muted-foreground">
                                        from subscription
                                    </div>
                                </div>
                            ) : (
                                <div className="text-right mr-2">
                                    <div className="text-sm font-bold text-green-600">
                                        ₹{cost}
                                    </div>
                                    <div className="text-[10px] text-muted-foreground">
                                        Due Amount
                                    </div>
                                </div>
                            )}

                            {isSubscriber ? (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleComplete(slot.id)}
                                    disabled={confirming === slot.id}
                                >
                                    {confirming === slot.id ? "..." : "Dismiss"}
                                </Button>
                            ) : (
                                <Button
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                    onClick={() => setPaymentModal({ slot, amount: cost })}
                                >
                                    Collect
                                </Button>
                            )}
                        </div>
                    </div>
                );
            })}

            {/* Payment Modal */}
            <Dialog open={!!paymentModal} onOpenChange={(open) => !open && setPaymentModal(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Payment</DialogTitle>
                        <DialogDescription>
                            Select payment method for <b>{paymentModal?.slot.user?.name || "Guest"}</b>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-6 flex flex-col items-center justify-center gap-4">
                        <div className="text-3xl font-bold text-green-600">
                            ₹{paymentModal?.amount}
                        </div>
                        <p className="text-sm text-muted-foreground">Session Duration: {paymentModal?.slot.duration} mins</p>

                        <div className="grid grid-cols-2 gap-3 w-full mt-4">
                            <Button variant="outline" className="h-20 flex flex-col gap-2 hover:bg-green-50 hover:border-green-200 hover:text-green-700" onClick={() => paymentModal && handleComplete(paymentModal.slot.id)}>
                                <Wallet className="h-6 w-6" />
                                Cash Received
                            </Button>
                            <Button variant="outline" className="h-20 flex flex-col gap-2 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700" onClick={() => paymentModal && handleComplete(paymentModal.slot.id)}>
                                <div className="font-bold text-lg">UPI</div>
                                Online Transfer
                            </Button>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setPaymentModal(null)}>Cancel</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
