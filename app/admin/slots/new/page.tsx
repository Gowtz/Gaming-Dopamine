import SlotForm from "@/components/admin/SlotForm";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function NewSlotPage() {
    return (
        <div className="max-w-4xl">
            <Link
                href="/admin/slots"
                className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-8 group w-fit"
            >
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-xs font-bold uppercase tracking-widest">Back to Dashboard</span>
            </Link>

            <div className="mb-12">
                <h1 className="text-4xl font-extrabold font-outfit tracking-tighter">Create Single Slot</h1>
                <p className="text-zinc-500 mt-1">Define a specific gaming session with time and pricing.</p>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-3xl backdrop-blur-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
                <SlotForm />
            </div>
        </div>
    );
}
