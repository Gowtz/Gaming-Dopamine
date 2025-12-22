"use client";

import React from "react";
import Link from "next/link";
import { Gamepad2, Instagram, Twitter, Facebook, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
    return (
        <footer id="contact" className="bg-card pt-20 pb-10 px-6 border-t border-border">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Brand */}
                    <div className="flex flex-col gap-6">
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                                <Gamepad2 className="text-white w-6 h-6" />
                            </div>
                            <span className="text-xl font-bold tracking-tighter font-outfit uppercase">
                                DOPAMINE<span className="text-primary">GAMING</span>
                            </span>
                        </Link>
                        <p className="text-foreground/50 leading-relaxed">
                            Your neighborhood premium gaming destination. PS5, VR, and Pro Racing Simulators under one roof.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="p-2 border border-border rounded-lg hover:border-primary transition-colors">
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a href="#" className="p-2 border border-border rounded-lg hover:border-primary transition-colors">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="#" className="p-2 border border-border rounded-lg hover:border-primary transition-colors">
                                <Facebook className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-bold uppercase tracking-widest text-sm mb-6 border-l-4 border-primary pl-4">
                            Quick Links
                        </h4>
                        <ul className="flex flex-col gap-4 text-foreground/60">
                            <li><Link href="#experiences" className="hover:text-primary transition-colors uppercase text-sm tracking-tight">Experiences</Link></li>
                            <li><Link href="#menu" className="hover:text-primary transition-colors uppercase text-sm tracking-tight">Café Menu</Link></li>
                            <li><Link href="#about" className="hover:text-primary transition-colors uppercase text-sm tracking-tight">Why Us</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors uppercase text-sm tracking-tight">Privacy Policy</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="font-bold uppercase tracking-widest text-sm mb-6 border-l-4 border-primary pl-4">
                            Get In Touch
                        </h4>
                        <ul className="flex flex-col gap-4 text-foreground/60">
                            <li className="flex items-center gap-3">
                                <MapPin className="w-5 h-5 text-primary" />
                                <span className="text-sm">123 Gamer St, Tech City</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-primary" />
                                <span className="text-sm">+1 (555) 001-PLAY</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-primary" />
                                <span className="text-sm">hello@dopaminegaming.com</span>
                            </li>
                        </ul>
                    </div>

                    {/* Opening Hours */}
                    <div>
                        <h4 className="font-bold uppercase tracking-widest text-sm mb-6 border-l-4 border-primary pl-4">
                            Opening Hours
                        </h4>
                        <ul className="flex flex-col gap-3 text-sm text-foreground/60">
                            <li className="flex justify-between">
                                <span>Mon - Thu</span>
                                <span className="font-bold text-foreground">10AM - 11PM</span>
                            </li>
                            <li className="flex justify-between">
                                <span>Fri - Sat</span>
                                <span className="font-bold text-neon-blue">10AM - 3AM</span>
                            </li>
                            <li className="flex justify-between">
                                <span>Sunday</span>
                                <span className="font-bold text-foreground">12PM - 10PM</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-border pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-xs text-foreground/30 uppercase tracking-[0.2em]">
                        © 2024 DOPAMINE GAMING CAFÉ. ALL RIGHTS RESERVED.
                    </p>
                    <p className="text-xs text-foreground/30 uppercase tracking-[0.2em] flex items-center gap-2">
                        DESIGNED BY <span className="text-primary font-bold">ANTIGRAVITY</span>
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
