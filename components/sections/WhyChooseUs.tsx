"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { ShieldCheck, Zap, Scissors, Users, CreditCard } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const features = [
    {
        title: "Low Latency",
        desc: "Gigabit fiber internet & high-refresh monitors.",
        icon: <Zap className="text-yellow-400" />,
    },
    {
        title: "High-End Gear",
        desc: "Late-model PS5s & pro racing rigs.",
        icon: <ShieldCheck className="text-primary" />,
    },
    {
        title: "Eco Seating",
        desc: "Secretlab gaming chairs for ultimate comfort.",
        icon: <Scissors className="text-neon-purple" />, // Using Scissors as a placeholder for "sharp" gear or craft
    },
    {
        title: "Group Events",
        desc: "Perfect for parties and team building sessions.",
        icon: <Users className="text-neon-green" />,
    },
    {
        title: "Fair Pricing",
        desc: "Competitive hourly rates & membership deals.",
        icon: <CreditCard className="text-orange-400" />,
    },
];

const WhyChooseUs = () => {
    const sectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(".feature-card",
                {
                    opacity: 0,
                    scale: 0.8,
                },
                {
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: "top 75%",
                        once: true,
                    },
                    opacity: 1,
                    scale: 1,
                    stagger: 0.1,
                    duration: 0.8,
                    ease: "expo.out",
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
        <section id="about" ref={sectionRef} className="pt-24 pb-12 px-6 bg-background relative">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-6xl font-black font-outfit uppercase tracking-tighter mb-4">
                        The <span className="text-primary">Best Setup</span> in Town
                    </h2>
                    <p className="text-foreground/50 max-w-xl mx-auto uppercase tracking-widest text-sm">
                        Everything you need for an elite gaming experience
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                    {features.map((feature, index) => (
                        <div key={index} className="feature-card p-8 rounded-3xl bg-card border border-border flex flex-col items-center text-center group hover:bg-white/5 transition-[background-color,transform] duration-300">
                            <div className="mb-6 p-4 bg-background rounded-2xl group-hover:scale-110 group-hover:-rotate-6 transition-transform">
                                {feature.icon}
                            </div>
                            <h4 className="font-bold text-lg mb-2">{feature.title}</h4>
                            <p className="text-sm text-foreground/40">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default WhyChooseUs;
