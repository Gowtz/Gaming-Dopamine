import BulkSlotForm from "@/components/admin/BulkSlotForm";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function BulkCreatePage() {
    return (
        <div className="max-w-4xl space-y-6">
            <Button asChild variant="ghost" className="pl-0 hover:bg-transparent hover:text-primary">
                <Link href="/admin/slots" className="flex items-center gap-2 group">
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Dashboard
                </Link>
            </Button>

            <div>
                <h1 className="text-3xl font-bold tracking-tight">Bulk Create Slots</h1>
                <p className="text-muted-foreground">Generate multiple slots across a date range at once.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Configuration</CardTitle>
                    <CardDescription>Set the parameters for generating bulk slots.</CardDescription>
                </CardHeader>
                <CardContent>
                    <BulkSlotForm />
                </CardContent>
            </Card>
        </div>
    );
}
