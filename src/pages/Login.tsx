import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Zap, Mail, Lock, User, Gamepad2, Shield, ArrowLeft, Github } from "lucide-react";
import { useRole, UserRole } from "@/contexts/RoleContext";
import { motion, AnimatePresence } from "framer-motion";
import { AuthInput, RoleCard } from "@/components/auth/AuthComponents";
import { Scene3D } from "@/components/home/Scene3D";
import { SportsBackground } from "@/components/ui/SportsBackground";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<UserRole>("player");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useRole();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      login(name || "Arjun", role);
      navigate(role === "player" ? "/dashboard" : "/provider");
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen w-full flex overflow-hidden bg-background">
      {/* Absolute Background for mobile/texture */}
      <SportsBackground className="opacity-40" />
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
        <Scene3D />
      </div>

      {/* Back to Home Navigation */}
      <Link
        to="/"
        className="absolute top-8 left-8 z-50 group flex items-center gap-2 px-5 py-2.5 rounded-full bg-background/40 backdrop-blur-md border border-white/10 text-sm font-medium text-white transition-all hover:bg-white/10 hover:border-white/20 hover:scale-105 active:scale-95"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        <span>Back to Home</span>
      </Link>

      {/* Left Section - Branding (Desktop Only) */}
      <div className="hidden lg:flex w-1/2 relative flex-col justify-center p-12 lg:-mt-20">
        <div className="relative z-10 max-w-lg space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-md shadow-[0_0_15px_rgba(var(--primary),0.3)]">
              <Zap className="h-4 w-4 text-primary fill-primary" />
              <span className="text-xs font-bold text-primary tracking-wider uppercase">The Future of Sports</span>
            </div>
            <h1 className="text-7xl font-black tracking-tighter text-white leading-[0.9]">
              Play.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary/80 to-blue-500 animate-gradient-x">
                Compete.
              </span><br />
              Conquer.
            </h1>
            <p className="text-lg text-muted-foreground/80 leading-relaxed max-w-md font-light">
              Join the elite network of players and premium turf providers. Experience sports booking reimagined for the modern athlete.
            </p>
          </motion.div>

          {/* Testimonial / Social Proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="flex items-center gap-4 pt-4"
          >
            <div className="flex -space-x-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-12 h-12 rounded-full border-2 border-background bg-zinc-800 flex items-center justify-center text-xs font-bold ring-2 ring-background text-white">
                  U{i}
                </div>
              ))}
            </div>
            <div className="text-sm font-medium text-white">
              <span className="text-primary font-bold text-base">2,000+</span><br />Athletes Active Now
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Section - Auth Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 lg:p-12 relative lg:mt-20">
        <div className="w-full max-w-md relative z-10">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-zinc-900/60 backdrop-blur-2xl border border-white/10 p-8 rounded-[2rem] shadow-2xl ring-1 ring-white/5"
          >
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
                {isLogin ? "Welcome back" : "Create account"}
              </h2>
              <p className="text-zinc-400">
                {isLogin ? "Enter your credentials to access your account" : "Choose your role to get started"}
              </p>
            </div>

            {/* Role Selection (Signup Only) */}
            <AnimatePresence>
              {!isLogin && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mb-8 overflow-hidden"
                >
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4 block">
                    Select your role
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <RoleCard
                      label="Athlete"
                      icon={Gamepad2}
                      description="Book & Play"
                      isSelected={role === "player"}
                      onClick={() => setRole("player")}
                    />
                    <RoleCard
                      label="Partner"
                      icon={Shield}
                      description="Host & Earn"
                      isSelected={role === "provider"}
                      onClick={() => setRole("provider")}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence>
                {!isLogin && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <AuthInput
                      label="Full Name"
                      icon={User}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mb-4"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <AuthInput
                label="Email Address"
                icon={Mail}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <AuthInput
                label="Password"
                icon={Lock}
                type="password"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-primary to-lime-600 text-black rounded-xl font-bold text-lg hover:brightness-110 active:scale-[0.98] transition-all duration-200 disabled:opacity-70 flex items-center justify-center shadow-[0_0_20px_rgba(var(--primary),0.3)] mt-2"
              >
                {loading ? (
                  <div className="h-5 w-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                  <span className="flex items-center gap-2">
                    {isLogin ? "Sign In" : "Get Started"}
                    <Zap className="h-4 w-4 fill-black" />
                  </span>
                )}
              </button>
            </form>

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/5" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
                  <span className="bg-transparent px-2 text-zinc-500">Or continue with</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button type="button" className="flex items-center justify-center gap-2 h-10 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all active:scale-95 group">
                  <svg className="h-5 w-5 grayscale group-hover:grayscale-0 transition-all opacity-80 group-hover:opacity-100" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  <span className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">Google</span>
                </button>
                <button type="button" className="flex items-center justify-center gap-2 h-10 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all active:scale-95 group">
                  <Github className="h-5 w-5 text-zinc-400 group-hover:text-white transition-colors" />
                  <span className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">Github</span>
                </button>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/5 text-center">
              <p className="text-zinc-500 text-sm">
                {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-primary hover:text-primary/80 font-semibold ml-1 transition-colors hover:underline underline-offset-4"
                >
                  {isLogin ? "Sign up now" : "Log in"}
                </button>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Login;
