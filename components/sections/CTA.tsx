"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ArrowRight } from "lucide-react";

const CTA = () => {
    const ctaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(".cta-content > *", {
                scrollTrigger: {
                    trigger: ctaRef.current,
                    start: "top 80%",
                },
                y: 40,
                opacity: 0,
                stagger: 0.2,
                duration: 0.8,
                ease: "power3.out",
            });
        }, ctaRef);

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
        <section ref={ctaRef} className="py-12 px-6 relative overflow-hidden">
            <div className="max-w-7xl mx-auto">
                <div className="relative bg-gradient-to-br from-primary/20 via-secondary/20 to-background border border-white/10 rounded-[3rem] p-12 md:p-24 text-center overflow-hidden">
                    {/* Animated background glow */}
                    <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/20 blur-[120px] animate-pulse" />
                    <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-neon-purple/20 blur-[120px] animate-pulse delay-700" />

                    <div className="cta-content relative z-10 max-w-3xl mx-auto">
                        <h2 className="text-5xl md:text-7xl font-black font-outfit uppercase tracking-tighter mb-8 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/50">
                            Ready to <br />
                            <span className="text-neon-blue">Level Up?</span>
                        </h2>
                        <p className="text-xl text-foreground/60 mb-12 uppercase tracking-widest font-medium">
                            Don't miss out on the ultimate gaming experience.
                            Book your slot now and join the community.
                        </p>

                        <button className="group relative bg-primary hover:bg-neon-blue text-white px-12 py-5 rounded-full font-black text-xl transition-all shadow-[0_0_50px_rgba(59,130,246,0.5)] flex items-center gap-3 mx-auto overflow-hidden">
                            <span className="relative z-10 uppercase tracking-widest">Reserve Your Slot</span>
                            <ArrowRight className="relative z-10 group-hover:translate-x-2 transition-transform" />
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CTA;
