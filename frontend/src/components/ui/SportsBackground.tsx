
import { cn } from "@/lib/utils";

export const SportsBackground = ({ className }: { className?: string }) => {
    return (
        <div className={cn("fixed inset-0 -z-50 overflow-hidden bg-background pointer-events-none", className)}>
            {/* Primary gradient mash */}
            <div className="absolute top-0 left-0 w-full h-full opacity-40 bg-[radial-gradient(circle_at_50%_-20%,hsl(var(--primary)/0.15),transparent_50%)]" />

            {/* Angular accent lines */}
            <div className="absolute top-0 right-0 w-[80%] h-[80%] opacity-10 bg-[linear-gradient(to_bottom_left,hsl(var(--primary)),transparent_40%)]" />

            {/* Grid pattern overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.3)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.3)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />

            {/* Floating geometric shapes */}
            <div className="absolute top-1/4 left-10 w-24 h-24 border border-primary/20 rounded-full opacity-20 animate-pulse" />
            <div className="absolute bottom-1/3 right-10 w-64 h-64 border border-primary/10 rounded-full opacity-10 blur-3xl" />
        </div>
    );
};
