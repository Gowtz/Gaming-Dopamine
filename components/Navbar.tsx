"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Gamepad2, Menu, X, User as UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";

import { useSession, signOut } from "next-auth/react";
import Image from "next/image";

const Navbar = () => {
    const { data: session } = useSession();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    if (!mounted) return null;

    const navLinks = [
        { name: "Experiences", href: "/#experiences" },
        { name: "Menu", href: "/#menu" },
        { name: "About", href: "/#about" },
        { name: "Contact", href: "/#contact" },
    ];

    return (
        <nav
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-4",
                isScrolled
                    ? "bg-background/80 backdrop-blur-md border-b border-border py-3"
                    : "bg-transparent"
            )}
        >
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group">
                    <Image
                        src="/images/Logo.png"
                        alt="Logo"
                        width={60}
                        height={60}
                        className="w-16 h-16 object-contain"
                    />
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="text-sm font-medium hover:text-primary transition-colors uppercase tracking-widest"
                        >
                            {link.name}
                        </Link>
                    ))}

                    {session ? (
                        <div className="relative">
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex items-center gap-3 p-1 pr-4 bg-zinc-900 border border-zinc-800 rounded-full hover:border-primary transition-all overflow-hidden"
                            >
                                <div className="w-8 h-8 rounded-full overflow-hidden">
                                    {session.user?.image ? (
                                        <Image src={session.user.image} alt="User" width={32} height={32} />
                                    ) : (
                                        <div className="w-full h-full bg-primary flex items-center justify-center text-xs">
                                            {session.user?.name?.[0]}
                                        </div>
                                    )}
                                </div>
                                <span className="text-xs font-bold uppercase tracking-wider">{session.user?.name?.split(' ')[0]}</span>
                            </button>

                            {isProfileOpen && (
                                <div className="absolute right-0 mt-4 w-48 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-2 py-3 backdrop-blur-xl">
                                    <Link
                                        href="/profile"
                                        onClick={() => setIsProfileOpen(false)}
                                        className="flex items-center gap-3 px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-all"
                                    >
                                        <UserIcon className="w-4 h-4" /> Profile
                                    </Link>
                                    <button
                                        onClick={() => signOut()}
                                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-xl transition-all mt-1"
                                    >
                                        <X className="w-4 h-4" /> Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link
                            href="/auth/signin"
                            className="bg-primary hover:bg-neon-blue text-white px-6 py-2 rounded-full font-bold transition-all shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_30px_rgba(0,242,255,0.6)] uppercase text-sm tracking-widest"
                        >
                            Login
                        </Link>
                    )}
                </div>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden text-foreground p-2"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu */}
            <div
                className={cn(
                    "fixed inset-0 bg-background z-40 flex flex-col items-center justify-center gap-8 transition-transform duration-500 md:hidden",
                    isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
                )}
            >
                <button
                    className="absolute top-6 right-6 p-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                >
                    <X className="w-8 h-8" />
                </button>
                {navLinks.map((link) => (
                    <Link
                        key={link.name}
                        href={link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-2xl font-bold uppercase tracking-widest hover:text-primary transition-colors"
                    >
                        {link.name}
                    </Link>
                ))}

                {session ? (
                    <div className="flex flex-col items-center gap-4">
                        <Link
                            href="/profile"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="text-2xl font-bold uppercase tracking-widest hover:text-primary"
                        >
                            Profile
                        </Link>
                        <button
                            onClick={() => signOut()}
                            className="text-2xl font-bold uppercase tracking-widest text-red-500"
                        >
                            Logout
                        </button>
                    </div>
                ) : (
                    <Link
                        href="/auth/signin"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="bg-primary text-white px-10 py-4 rounded-full font-bold text-xl transition-all shadow-lg mt-4 uppercase tracking-widest"
                    >
                        Login
                    </Link>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
