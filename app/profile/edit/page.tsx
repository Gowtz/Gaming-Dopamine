import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import ProfileForm from "@/components/profile/ProfileForm";
import { Gamepad2 } from "lucide-react";

export default async function EditProfilePage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/auth/signin");
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email! },
        include: { preferences: true }
    });

    if (!user) {
        redirect("/auth/signin");
    }

    const initialData = {
        favoriteGames: user.preferences?.favoriteGames || [],
        hasPS5: user.preferences?.hasPS5 || false,
        hasVR: user.preferences?.hasVR || false,
        hasRacingSim: user.preferences?.hasRacingSim || false,
    };

    return (
        <div className="min-h-screen bg-black text-white pb-20 pt-32 px-6">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-12">
                    <div className="p-4 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-600/20">
                        <Gamepad2 className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight font-outfit">Edit Profile</h1>
                        <p className="text-zinc-500 mt-1">Customize your gaming preferences and experience.</p>
                    </div>
                </div>

                <div className="p-8 bg-zinc-900/50 border border-zinc-800 rounded-3xl shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
                    <ProfileForm initialData={initialData} />
                </div>
            </div>
        </div>
    );
}
