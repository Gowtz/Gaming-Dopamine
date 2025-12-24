import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function checkAdmin() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/auth/signin");
    }

    if (session.user.role !== "ADMIN") {
        redirect("/unauthorized");
    }

    return session;
}
