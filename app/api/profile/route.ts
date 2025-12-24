import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { favoriteGames, hasPS5, hasVR, hasRacingSim } = await req.json();

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return new NextResponse("User not found", { status: 404 });
        }

        await prisma.preferences.upsert({
            where: { userId: user.id },
            update: {
                favoriteGames,
                hasPS5,
                hasVR,
                hasRacingSim,
            },
            create: {
                userId: user.id,
                favoriteGames,
                hasPS5,
                hasVR,
                hasRacingSim,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Profile update error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
