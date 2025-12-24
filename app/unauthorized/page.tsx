import { ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function UnauthorizedPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-black text-white px-6">
            <div className="max-w-md w-full text-center space-y-8 p-12 bg-zinc-900/50 border border-zinc-800 rounded-3xl backdrop-blur-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>

                <div className="flex justify-center">
                    <div className="w-20 h-20 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 shadow-lg shadow-red-500/10">
                        <ShieldAlert className="w-10 h-10" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h1 className="text-3xl font-extrabold font-outfit">Access Denied</h1>
                    <p className="text-zinc-500">
                        You don't have the administrative privileges required to view this section.
                    </p>
                </div>

                <div className="pt-4 flex flex-col gap-3">
                    <Link
                        href="/"
                        className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl transition-all"
                    >
                        Back to Home
                    </Link>
                    <Link
                        href="/profile"
                        className="w-full py-4 text-zinc-400 hover:text-white font-bold transition-all"
                    >
                        Visit Your Profile
                    </Link>
                </div>
            </div>
        </div>
    );
}
