
import { motion, useMotionValue, useTransform, MotionValue } from "framer-motion";
import { cn } from "@/lib/utils";
import { Trophy, Users, Zap, Calendar, MapPin } from "lucide-react";

interface Home3DUIProps {
    mouseX: MotionValue<number>;
    mouseY: MotionValue<number>;
}

const FloatingCard = ({
    className,
    children,
    depth = 1,
    mouseX,
    mouseY
}: {
    className?: string;
    children: React.ReactNode;
    depth?: number;
    mouseX: MotionValue<number>;
    mouseY: MotionValue<number>;
}) => {
    const x = useTransform(mouseX, [0, 1], [-20 * depth, 20 * depth]);
    const y = useTransform(mouseY, [0, 1], [-20 * depth, 20 * depth]);
    const rotateX = useTransform(mouseY, [0, 1], [5 * depth, -5 * depth]);
    const rotateY = useTransform(mouseX, [0, 1], [-5 * depth, 5 * depth]);

    return (
        <motion.div
            style={{ x, y, rotateX, rotateY }}
            className={cn(
                "absolute p-4 rounded-2xl border border-white/10 bg-background/20 backdrop-blur-md shadow-xl",
                className
            )}
        >
            {children}
        </motion.div>
    );
};

const CSSCube = ({ className }: { className?: string }) => {
    const halfSize = "24px"; // w-12 = 48px, so half is 24px

    return (
        <div className={cn("relative w-12 h-12 [transform-style:preserve-3d] animate-[spin_10s_linear_infinite]", className)}>
            {/* Front */}
            <div className="absolute inset-0 border border-primary/40 bg-primary/10 [transform:translateZ(24px)]" />
            {/* Back */}
            <div className="absolute inset-0 border border-primary/40 bg-primary/10 [transform:translateZ(-24px)]" />
            {/* Right */}
            <div className="absolute inset-0 border border-primary/40 bg-primary/10 [transform:rotateY(90deg)_translateZ(24px)]" />
            {/* Left */}
            <div className="absolute inset-0 border border-primary/40 bg-primary/10 [transform:rotateY(-90deg)_translateZ(24px)]" />
            {/* Top */}
            <div className="absolute inset-0 border border-primary/40 bg-primary/10 [transform:rotateX(90deg)_translateZ(24px)]" />
            {/* Bottom */}
            <div className="absolute inset-0 border border-primary/40 bg-primary/10 [transform:rotateX(-90deg)_translateZ(24px)]" />
        </div>
    );
};

export const Home3DUI = ({ mouseX, mouseY }: Home3DUIProps) => {
    return (
        <div className="absolute inset-0 z-10 pointer-events-none perspective-[2000px]">
            <div className="relative w-full h-full [transform-style:preserve-3d]">

                {/* Floating CSS Cubes (Creative 3D Elements) */}
                <FloatingCard mouseX={mouseX} mouseY={mouseY} depth={0.5} className="top-[15%] left-[5%] border-none bg-transparent shadow-none">
                    <CSSCube className="opacity-80" />
                </FloatingCard>

                <FloatingCard mouseX={mouseX} mouseY={mouseY} depth={2} className="bottom-[20%] right-[15%] border-none bg-transparent shadow-none">
                    <CSSCube className="scale-150 opacity-40 animate-[spin_15s_linear_infinite_reverse]" />
                </FloatingCard>

                <FloatingCard mouseX={mouseX} mouseY={mouseY} depth={-0.5} className="top-[40%] right-[5%] border-none bg-transparent shadow-none">
                    <CSSCube className="scale-75 opacity-30 animate-[spin_20s_linear_infinite]" />
                </FloatingCard>

                {/* Player Stats Card - Top Left */}
                <FloatingCard
                    mouseX={mouseX}
                    mouseY={mouseY}
                    depth={2}
                    className="top-[20%] left-[10%] w-48 hidden lg:block"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-primary/20 text-primary">
                            <Zap className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-bold text-white">Avg Pace</span>
                    </div>
                    <div className="text-2xl font-black text-white">8.4 <span className="text-xs font-normal text-muted-foreground">km/h</span></div>
                    <div className="w-full h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
                        <div className="h-full w-[80%] bg-primary shadow-[0_0_10px_var(--primary)]" />
                    </div>
                </FloatingCard>

                {/* Match Invite - Bottom Right */}
                <FloatingCard
                    mouseX={mouseX}
                    mouseY={mouseY}
                    depth={1.5}
                    className="bottom-[25%] right-[10%] w-64 hidden lg:block"
                >
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-primary uppercase tracking-wider">Match Invite</span>
                        <span className="text-[10px] text-muted-foreground">Just now</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex -space-x-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-8 h-8 rounded-full border border-background bg-secondary flex items-center justify-center text-[10px]">
                                    P{i}
                                </div>
                            ))}
                        </div>
                        <div className="text-sm text-white font-medium">
                            5v5 Football<br />
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <MapPin className="h-3 w-3" /> TurfZilla Arena
                            </span>
                        </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                        <div className="flex-1 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold text-center">Accept</div>
                        <div className="flex-1 py-1.5 rounded-lg bg-white/5 text-white text-xs font-bold text-center">Decline</div>
                    </div>
                </FloatingCard>

                {/* Live Status - Top Right (Further back) */}
                <FloatingCard
                    mouseX={mouseX}
                    mouseY={mouseY}
                    depth={0.5}
                    className="top-[15%] right-[20%] w-auto hidden lg:block border-primary/20 bg-primary/5"
                >
                    <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <span className="text-xs font-medium text-white">24 Active Games nearby</span>
                    </div>
                </FloatingCard>

                {/* Achievement Unlock - Bottom Left */}
                <FloatingCard
                    mouseX={mouseX}
                    mouseY={mouseY}
                    depth={1.2}
                    className="bottom-[20%] left-[15%] w-auto hidden lg:block"
                >
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Trophy className="h-8 w-8 text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
                        </div>
                        <div>
                            <div className="text-xs text-yellow-500 font-bold uppercase">Achievement Unlocked</div>
                            <div className="text-sm text-white font-bold">Hat-trick Hero</div>
                        </div>
                    </div>
                </FloatingCard>

            </div>
        </div>
    );
};
