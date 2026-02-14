
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
    ArrowRight,
    MapPin,
    Users,
    CalendarDays,
    Trophy,
    Activity,
    Zap
} from "lucide-react";
import { motion, useScroll, useTransform, useSpring, useMotionValue } from "framer-motion";
import { cn } from "@/lib/utils";
import { Scene3D } from "./Scene3D";
import { Home3DUI } from "./Home3DUI";

const FloatingElement = ({
    children,
    delay = 0,
    className
}: {
    children: React.ReactNode;
    delay?: number;
    className?: string
}) => {
    return (
        <motion.div
            initial={{ y: 0 }}
            animate={{ y: [-10, 10, -10] }}
            transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay
            }}
            className={cn("absolute hidden lg:flex items-center justify-center backdrop-blur-md border border-white/10 shadow-2xl rounded-2xl p-4 bg-black/20", className)}
        >
            {children}
        </motion.div>
    );
};

export const Hero = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 500], [0, 200]);
    const y2 = useTransform(scrollY, [0, 500], [0, -100]);

    // Mouse parallax
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const mouseX = useSpring(x, { stiffness: 50, damping: 20 });
    const mouseY = useSpring(y, { stiffness: 50, damping: 20 });

    const handleMouseMove = (e: React.MouseEvent) => {
        const { clientX, clientY } = e;
        const { innerWidth, innerHeight } = window;
        x.set((clientX / innerWidth - 0.5) * 50);
        y.set((clientY / innerHeight - 0.5) * 50);
    };

    return (
        <section
            ref={containerRef}
            onMouseMove={handleMouseMove}
            className="relative min-h-[110vh] flex items-center justify-center overflow-hidden pb-20 pt-32"
        >
            {/* Dynamic Background */}
            <div className="absolute inset-0 z-0">
                {/* Deep Field Gradient */}
                <div className="absolute inset-0 bg-background" />

                {/* Stadium Lights Effect */}
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[70%] bg-primary/20 blur-[150px] rounded-full mix-blend-screen opacity-60" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[60%] bg-blue-600/20 blur-[150px] rounded-full mix-blend-screen opacity-50" />

                {/* Turf Grid Texture */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_60%,transparent_100%)]" />

                {/* Radial Glow */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,hsl(var(--background))_80%)]" />
            </div>

            {/* 3D Scene Background */}
            <div className="absolute inset-0 z-0 opacity-60">
                <Scene3D />
            </div>

            {/* Interactive 3D UI Overlay */}
            <Home3DUI mouseX={mouseX} mouseY={mouseY} />

            {/* Main Content */}
            <div className="relative z-20 container px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.215, 0.610, 0.355, 1.000] }}
                    className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl mb-8 group cursor-default hover:bg-white/10 transition-colors"
                >
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                    </span>
                    <span className="text-sm font-medium text-primary/90 tracking-wide uppercase">New Season is Live</span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className="text-6xl md:text-8xl lg:text-9xl font-display font-bold tracking-tight leading-[0.9] mb-8"
                >
                    <span className="block text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60">
                        DOMINATE
                    </span>
                    <span className="block text-transparent bg-clip-text bg-gradient-to-b from-primary via-primary/80 to-primary/40 glitch-text">
                        THE FIELD
                    </span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="text-lg md:text-xl text-muted-foreground/80 max-w-2xl mx-auto mb-12 font-light leading-relaxed tracking-wide"
                >
                    Experience sports like never before. Book premium turfs, connect with local squads, and track your performance statistics in real-time.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    <Link
                        to="/dashboard"
                        className="group relative px-8 py-4 bg-primary text-primary-foreground font-bold text-lg rounded-xl overflow-hidden shadow-[0_0_40px_-10px_rgba(var(--primary),0.5)] hover:shadow-[0_0_60px_-10px_rgba(var(--primary),0.6)] transition-all duration-300"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        <span className="relative flex items-center gap-2">
                            Start playing <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </span>
                    </Link>
                    <Link
                        to="/discover"
                        className="px-8 py-4 bg-white/5 border border-white/10 text-white font-semibold text-lg rounded-xl hover:bg-white/10 transition-colors backdrop-blur-md"
                    >
                        Browse Courts
                    </Link>
                </motion.div>

                {/* Stats Strip */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.5, delay: 1 }}
                    className="mt-20 pt-10 border-t border-white/5 grid grid-cols-3 gap-8 max-w-3xl mx-auto"
                >
                    <div className="text-center">
                        <h4 className="text-3xl font-display font-bold text-white mb-1">50+</h4>
                        <p className="text-xs text-muted-foreground uppercase tracking-widest">Premium Venues</p>
                    </div>
                    <div className="text-center">
                        <h4 className="text-3xl font-display font-bold text-white mb-1">2k+</h4>
                        <p className="text-xs text-muted-foreground uppercase tracking-widest">Active Players</p>
                    </div>
                    <div className="text-center">
                        <h4 className="text-3xl font-display font-bold text-white mb-1">4.9</h4>
                        <p className="text-xs text-muted-foreground uppercase tracking-widest">User Rating</p>
                    </div>
                </motion.div>
            </div>

            {/* Decorative Gradient Overlay at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
        </section>
    );
};
