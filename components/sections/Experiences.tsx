"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { Monitor, Cpu, Layers } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const experiences = [
    {
        title: "PS5 Gaming Zone",
        description: "Immerse yourself in 4K resolution and high-frame-rate gaming. Experience the fastest SSD and 3D audio on our premium OLED setups.",
        icon: <Monitor className="w-8 h-8" />,
        image: "/images/ps5_gaming_zone_1766381221627.png",
        accent: "border-neon-blue shadow-[0_0_20px_rgba(0,242,255,0.2)]",
        textShadow: "text-shadow-neon-blue",
        bgAccent: "bg-neon-blue/10"
    },
    {
        title: "Car Racing Simulator",
        description: "Feel the adrenaline with our professional-grade racing cockpits. Triple-monitor setup and force-feedback steering for ultimate realism.",
        icon: <Cpu className="w-8 h-8" />,
        image: "/images/racing_simulator_1766381237347.png",
        accent: "border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]",
        textShadow: "text-shadow-neon-red", // Need to add red shadow to globals if needed, or stick to blue/purple
        bgAccent: "bg-red-500/10"
    },
    {
        title: "VR Gaming Arena",
        description: "Step into another world. Our dedicated VR arena provides full-room tracking and the latest headsets for a truly boundless experience.",
        icon: <Layers className="w-8 h-8" />,
        image: "/images/vr_arena_gaming_1766381252791.png",
        accent: "border-neon-purple shadow-[0_0_20px_rgba(188,19,254,0.2)]",
        textShadow: "text-shadow-neon-purple",
        bgAccent: "bg-neon-purple/10"
    },
];

const Experiences = () => {
    const sectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(".experience-card",
                {
                    y: 100,
                    opacity: 0,
                },
                {
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: "top 80%",
                        once: true,
                    },
                    y: 0,
                    opacity: 1,
                    stagger: 0.2,
                    duration: 0.8,
                    ease: "power3.out",
                    immediateRender: false,
                }
            );
        }, sectionRef);

        const refreshTimeout = setTimeout(() => {
            ScrollTrigger.refresh();
        }, 100);

        return () => {
            ctx.revert();
            clearTimeout(refreshTimeout);
        };
    }, []);

    return (
        <section id="experiences" ref={sectionRef} className="pt-24 pb-12 px-6 bg-background relative overflow-hidden">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-6xl font-black font-outfit uppercase tracking-tighter mb-4">
                        Unrivaled <span className="text-primary italic">Experiences</span>
                    </h2>
                    <div className="w-24 h-1.5 bg-primary mx-auto rounded-full" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {experiences.map((exp, index) => (
                        <div
                            key={index}
                            className={`experience-card group relative bg-card border ${exp.accent} rounded-3xl overflow-hidden hover:-translate-y-4 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-[transform,shadow] duration-500`}
                        >
                            {/* Image Container */}
                            <div className="relative h-64 w-full overflow-hidden">
                                <Image
                                    src={exp.image}
                                    alt={exp.title}
                                    fill
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                                <div className={`absolute top-4 right-4 p-3 rounded-2xl backdrop-blur-md ${exp.bgAccent}`}>
                                    {exp.icon}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-8">
                                <h3 className={`text-2xl font-bold font-outfit uppercase tracking-tight mb-4 ${exp.textShadow}`}>
                                    {exp.title}
                                </h3>
                                <p className="text-foreground/60 leading-relaxed mb-6">
                                    {exp.description}
                                </p>
                                <button className="flex items-center gap-2 font-bold uppercase tracking-widest text-sm hover:gap-4 transition-all text-primary">
                                    LEARN MORE <span className="text-xl">→</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Experiences;
