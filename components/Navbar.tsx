"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Gamepad2, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
        { name: "Experiences", href: "#experiences" },
        { name: "Menu", href: "#menu" },
        { name: "About", href: "#about" },
        { name: "Contact", href: "#contact" },
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
                    <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center group-hover:bg-neon-blue transition-colors shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                        <Gamepad2 className="text-white w-6 h-6" />
                    </div>
                    <span className="text-xl font-bold tracking-tighter font-outfit">
                        DOPAMINE<span className="text-primary group-hover:text-neon-blue transition-colors">GAMING</span>
                    </span>
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
                    <button className="bg-primary hover:bg-neon-blue text-white px-6 py-2 rounded-full font-bold transition-all shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_30px_rgba(0,242,255,0.6)]">
                        BOOK NOW
                    </button>
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
                <button className="bg-primary text-white px-10 py-4 rounded-full font-bold text-xl transition-all shadow-lg mt-4">
                    BOOK NOW
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
