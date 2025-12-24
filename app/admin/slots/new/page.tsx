import SlotForm from "@/components/admin/SlotForm";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewSlotPage() {
    return (
        <div className="max-w-4xl space-y-6">
            <Button asChild variant="ghost" className="pl-0 hover:bg-transparent hover:text-primary">
                <Link href="/admin/slots" className="flex items-center gap-2 group">
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Dashboard
                </Link>
            </Button>

            <div>
                <h1 className="text-3xl font-bold tracking-tight">Create Single Slot</h1>
                <p className="text-muted-foreground">Define a specific gaming session with time and pricing.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Slot Details</CardTitle>
                    <CardDescription>Enter the information for the new gaming slot.</CardDescription>
                </CardHeader>
                <CardContent>
                    <SlotForm />
                </CardContent>
            </Card>
        </div>
    );
}
