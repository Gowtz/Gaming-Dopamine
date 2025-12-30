"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";

const Hero = () => {
    const heroRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Intro animations
            const tl = gsap.timeline();

            tl.from(".hero-bg", {
                scale: 1.2,
                duration: 2,
                ease: "power2.out",
            })
                .from(".hero-text > *", {
                    y: 50,
                    opacity: 0,
                    stagger: 0.2,
                    duration: 1,
                    ease: "power3.out",
                }, "-=1.5");
        }, heroRef);

        const refreshTimeout = setTimeout(() => {
            import("gsap/dist/ScrollTrigger").then(({ ScrollTrigger }) => {
                ScrollTrigger.refresh();
            });
        }, 100);

        return () => {
            ctx.revert();
            clearTimeout(refreshTimeout);
        };
    }, []);

    return (
        <section ref={heroRef} className="relative h-screen w-full flex items-center justify-center overflow-hidden">
            {/* Background Image with Overlay */}
            <div className="hero-bg absolute inset-0 z-0">
                <Image
                    src="/images/hero_gaming_cafe_1766381206435.png"
                    alt="Gaming Cafe"
                    fill
                    priority
                    sizes="100vw"
                    className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                <div className="absolute inset-0 bg-black/40" />
            </div>

            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 bg-grid-white/5 z-1" />

            {/* Content */}
            <div ref={contentRef} className="hero-text relative z-10 text-center px-6 max-w-5xl">
                <h1 className="text-5xl md:text-8xl font-black font-outfit uppercase tracking-tighter leading-none mb-6">
                    Level Up Your <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-neon-blue animate-gradient text-shadow-neon-blue">
                        Gaming Experience
                    </span>
                </h1>

                <p className="text-lg md:text-2xl text-foreground/80 font-medium max-w-2xl mx-auto mb-10 leading-relaxed uppercase tracking-widest">
                    High-Performance PS5 &bull; VR Arena &bull; Racing Simulators
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link href="/profile" className="w-full sm:w-auto">
                        <button className="w-full bg-primary hover:bg-neon-blue text-primary-foreground hover:text-white px-10 py-4 rounded-full font-black text-lg transition-all shadow-[0_0_30px_rgba(59,130,246,0.5)] hover:scale-105 active:scale-95">
                            BOOK A SLOT NOW
                        </button>
                    </Link>
                    <button className="w-full sm:w-auto border-2 border-white/20 hover:border-white/40 backdrop-blur-sm px-10 py-4 rounded-full font-black text-lg transition-all hover:bg-white/10 hover:scale-105 active:scale-95">
                        EXPLORE GAMES
                    </button>
                </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-50">
                <div className="w-6 h-10 border-2 border-foreground/30 rounded-full flex justify-center p-1">
                    <div className="w-1.5 h-1.5 bg-foreground/30 rounded-full" />
                </div>
            </div>
        </section>
    );
};

export default Hero;
