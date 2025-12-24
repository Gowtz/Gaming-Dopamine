"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { Coffee, Pizza, Zap, IceCream } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const snacks = [
    { name: "Neon Nachos", price: "₹8.99", icon: <Pizza />, color: "text-orange-400" },
    { name: "Cyber Burger", price: "₹12.99", icon: <Zap />, color: "text-yellow-400" },
    { name: "Mana Refresh", price: "₹5.99", icon: <Coffee />, color: "text-blue-400" },
    { name: "XP Ice Cream", price: "₹6.99", icon: <IceCream />, color: "text-purple-400" },
];

const Snacks = () => {
    const sectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(".snacks-header > *", {
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top 80%",
                    once: true,
                },
                y: 30,
                opacity: 0,
                stagger: 0.2,
                duration: 0.8,
                ease: "power3.out",
            });

            gsap.from(".snack-item", {
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top 70%",
                    once: true,
                },
                x: -50,
                opacity: 0,
                stagger: 0.1,
                duration: 0.6,
                ease: "back.out(1.7)",
            });

            gsap.from(".snacks-image", {
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top 60%",
                    once: true,
                },
                scale: 0.9,
                opacity: 0,
                duration: 1,
                ease: "power2.out",
            });
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
        <section id="menu" ref={sectionRef} className="py-12 px-6 bg-background relative border-y border-border">
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 items-center">
                {/* Left Side: Text */}
                <div className="lg:w-1/2 snacks-header">
                    <h2 className="text-4xl md:text-6xl font-black font-outfit uppercase tracking-tighter mb-8">
                        Fuel Your <span className="text-neon-green italic">Performance</span>
                    </h2>
                    <p className="text-xl text-foreground/60 leading-relaxed mb-10 max-w-xl">
                        Gaming is intense, and you need the right fuel to keep your edge.
                        Enjoy our curated menu of snacks and beverages designed for gamers.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {snacks.map((snack, index) => (
                            <div key={index} className="snack-item flex items-center gap-4 p-4 rounded-2xl bg-card border border-border group hover:border-neon-green transition-colors duration-300">
                                <div className={`p-3 rounded-xl bg-background transition-transform group-hover:rotate-12 ${snack.color}`}>
                                    {snack.icon}
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg">{snack.name}</h4>
                                    <p className="text-sm text-foreground/40">{snack.price}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="mt-12 group flex items-center gap-3 font-bold uppercase tracking-widest text-neon-green">
                        FULL CAFÉ MENU
                        <span className="w-12 h-0.5 bg-neon-green group-hover:w-20 transition-all duration-300" />
                    </button>
                </div>

                {/* Right Side: Image */}
                <div className="lg:w-1/2 relative snacks-image">
                    <div className="relative w-full aspect-square rounded-[3rem] overflow-hidden border-4 border-white/5">
                        <Image
                            src="/images/gaming_snacks_beverages_1766381268929.png"
                            alt="Gaming Snacks"
                            fill
                            sizes="(max-width: 1024px) 100vw, 50vw"
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-tr from-background/40 to-transparent" />
                    </div>

                    {/* Decorative element */}
                    <div className="absolute -top-8 -right-8 w-48 h-48 bg-primary/20 blur-[100px] z-0" />
                    <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-neon-purple/20 blur-[100px] z-0" />
                </div>
            </div>
        </section>
    );
};

export default Snacks;
