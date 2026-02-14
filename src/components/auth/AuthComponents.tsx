
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    icon: LucideIcon;
    error?: string;
}

export const AuthInput = ({ label, icon: Icon, error, className, ...props }: AuthInputProps) => {
    return (
        <div className={cn("relative group", className)}>
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary">
                <Icon className="h-5 w-5" />
            </div>
            <input
                {...props}
                placeholder=" "
                className={cn(
                    "peer w-full h-12 pl-10 pr-4 bg-secondary/50 border border-border rounded-xl text-foreground placeholder-transparent focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all",
                    error && "border-red-500 focus:ring-red-500/50"
                )}
            />
            <label
                className={cn(
                    "absolute left-10 top-1/2 -translate-y-1/2 text-sm text-muted-foreground transition-all pointer-events-none",
                    "peer-focus:-top-2.5 peer-focus:left-2 peer-focus:text-xs peer-focus:text-primary peer-focus:bg-background peer-focus:px-2",
                    "peer-not-placeholder-shown:-top-2.5 peer-not-placeholder-shown:left-2 peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:bg-background peer-not-placeholder-shown:px-2"
                )}
            >
                {label}
            </label>
            {error && (
                <span className="text-xs text-red-500 absolute -bottom-5 left-1">{error}</span>
            )}
        </div>
    );
};

interface RoleCardProps {
    label: string;
    icon: LucideIcon;
    description: string;
    isSelected: boolean;
    onClick: () => void;
}

export const RoleCard = ({ label, icon: Icon, description, isSelected, onClick }: RoleCardProps) => {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "relative p-6 rounded-2xl border-2 text-left transition-all duration-300 overflow-hidden group",
                isSelected
                    ? "border-primary bg-primary/5 shadow-[0_0_30px_hsl(var(--primary)/0.2)]"
                    : "border-border/50 bg-secondary/30 hover:border-primary/50 hover:bg-secondary/50"
            )}
        >
            {isSelected && (
                <motion.div
                    layoutId="role-glow"
                    className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-50"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
            )}

            <div className="relative z-10 flex flex-col gap-3">
                <div className={cn(
                    "p-3 rounded-lg w-fit transition-colors",
                    isSelected ? "bg-primary text-primary-foreground" : "bg-background/50 text-muted-foreground group-hover:text-primary"
                )}>
                    <Icon className="h-6 w-6" />
                </div>
                <div>
                    <h3 className={cn(
                        "font-bold text-lg transition-colors",
                        isSelected ? "text-primary" : "text-foreground"
                    )}>
                        {label}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">{description}</p>
                </div>
            </div>
        </button>
    );
};
