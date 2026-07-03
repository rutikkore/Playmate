
import { cn } from "@/lib/utils";

export const Scene3D = () => {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none flex items-center justify-center">
            <div className="relative w-[500px] h-[500px] opacity-40 animate-[spin_40s_linear_infinite]">
                {/* Outer Rings - Orbital Paths */}
                <div className="absolute inset-0 rounded-full border border-primary/20 blur-[1px]" />
                <div className="absolute inset-8 rounded-full border border-primary/10 border-dashed" />
                <div className="absolute inset-20 rounded-full border border-primary/30 rotate-[45deg] scale-y-75" />
                <div className="absolute inset-20 rounded-full border border-blue-500/20 rotate-[-45deg] scale-y-75" />

                {/* Central "Ball" Core - CSS Gradient Simulation */}
                <div className="absolute top-1/2 left-1/2 w-48 h-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-primary/20 via-black to-blue-500/20 shadow-[0_0_80px_rgba(132,204,22,0.2)] animate-pulse">
                    {/* Hex Pattern Overlay (Simulated with grid) */}
                    <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,transparent_0%,#000_100%)] opacity-80" />
                    <div className="absolute inset-0 rounded-full bg-[linear-gradient(45deg,transparent_45%,rgba(132,204,22,0.3)_50%,transparent_55%)] bg-[length:20px_20px]" />
                    <div className="absolute inset-0 rounded-full bg-[linear-gradient(-45deg,transparent_45%,rgba(132,204,22,0.3)_50%,transparent_55%)] bg-[length:20px_20px]" />
                </div>

                {/* Orbiting Satellites */}
                <div className="absolute top-1/2 left-1/2 w-[140%] h-[140%] -translate-x-1/2 -translate-y-1/2 animate-[spin_10s_linear_infinite]">
                    <div className="absolute top-0 left-1/2 w-3 h-3 bg-primary rounded-full blur-[2px] shadow-[0_0_10px_var(--primary)]" />
                </div>
            </div>

            {/* Grid Floor for depth */}
            <div className="absolute bottom-[-20%] left-[-50%] w-[200%] h-[50%] bg-[linear-gradient(transparent_0%,hsl(var(--primary)/0.05)_100%)] [transform:perspective(1000px)_rotateX(60deg)]" />
        </div>
    );
};
