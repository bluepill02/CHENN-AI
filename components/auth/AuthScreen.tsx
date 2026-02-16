import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { supabase } from '../../services/supabaseClient';

import { Input } from '../ui/input';
import { Mail, Loader2, MapPin, Users, Zap, Lock, Eye, EyeOff, CheckCircle2, ArrowRight } from 'lucide-react';
import {
    FloatingElement,
    AnimatedInput,
    RippleButton,
    PageTransition,
} from './AnimationComponents';
import { ChennaiCustomIcons } from '../CustomIcons';
import { PremiumIcon } from '../PremiumIcons';
import { AuthScreenBackground } from '../BackgroundAnimations';
import SEO from '../SEO';

type AuthMode = 'signin' | 'signup' | 'magic';

export function AuthScreen() {
    const [mode, setMode] = useState<AuthMode>('signin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [showConfetti, setShowConfetti] = useState(false);
    const [emailFocused, setEmailFocused] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);

    const handleEmailPasswordAuth = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            setMessage({ type: 'error', text: 'Please enter both email and password' });
            return;
        }

        if (password.length < 6) {
            setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            if (mode === 'signup') {
                const redirectTo = import.meta.env.VITE_SITE_URL || window.location.origin;

                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: redirectTo,
                    },
                });

                if (error) throw error;

                setMessage({
                    type: 'success',
                    text: 'Account created! Check your email to verify. 📧',
                });
                setShowConfetti(true);
                setTimeout(() => setShowConfetti(false), 5000);
                setEmail('');
                setPassword('');
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (error) throw error;
            }
        } catch (error: any) {
            setMessage({
                type: 'error',
                text: error.message || `Failed to ${mode === 'signup' ? 'create account' : 'sign in'}`,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setLoading(true);
        setMessage(null);

        try {
            const redirectTo = import.meta.env.VITE_SITE_URL || window.location.origin;

            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: redirectTo,
                },
            });

            if (error) throw error;
        } catch (error: any) {
            setMessage({
                type: 'error',
                text: error.message || 'Failed to sign in with Google',
            });
            setLoading(false);
        }
    };

    const handleMagicLink = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) {
            setMessage({ type: 'error', text: 'Please enter your email' });
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            const redirectTo = import.meta.env.VITE_SITE_URL || window.location.origin;

            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: redirectTo,
                },
            });

            if (error) throw error;

            setMessage({
                type: 'success',
                text: 'Check your email for the magic link! ✨',
            });
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 5000);
            setEmail('');
        } catch (error: any) {
            setMessage({
                type: 'error',
                text: error.message || 'Failed to send magic link',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageTransition>
            <SEO
                title="Connect with Chennai - Events, Jobs & Community"
                description="Join the Chennai Community App to discover local events, find jobs, get live city updates, and connect with your neighbors. The soul of Chennai, online."
                canonical="https://chenn-ai.vercel.app/"
            />
            <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
                {/* Premium animated background */}
                <div className="absolute inset-0 z-0">
                    <AuthScreenBackground />
                </div>

                {/* Confetti */}
                {showConfetti && (
                    <Confetti
                        width={window.innerWidth}
                        height={window.innerHeight}
                        recycle={false}
                        numberOfPieces={500}
                        gravity={0.3}
                    />
                )}

                {/* Floating Chennai Elements */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <FloatingElement delay={0} duration={6} yOffset={40} xOffset={20}>
                        <div className="absolute top-[15%] left-[5%] opacity-10 rotate-12">
                            <PremiumIcon icon="Auto" className="w-32 h-32" color="#FFED4E" animated={false} />
                        </div>
                    </FloatingElement>

                    <FloatingElement delay={2} duration={7} yOffset={30} xOffset={-20}>
                        <div className="absolute bottom-[20%] right-[5%] opacity-10 -rotate-12">
                            <PremiumIcon icon="Shop" className="w-40 h-40" color="#FECB81" animated={false} />
                        </div>
                    </FloatingElement>
                </div>

                {/* Main content */}
                <div className="w-full max-w-md relative z-10 perspective-1000">
                    {/* Logo section */}
                    <motion.div
                        className="text-center mb-10"
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, type: "spring", bounce: 0.5 }}
                    >
                        <motion.div
                            className="inline-flex items-center justify-center w-28 h-28 bg-white/10 backdrop-blur-md rounded-[2rem] shadow-[0_0_40px_rgba(0,0,0,0.2)] mb-6 relative border border-white/20 group"
                            whileHover={{ scale: 1.05, rotate: 5 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-400/20 to-purple-500/20 rounded-[2rem]" />
                            <div className="relative z-10 drop-shadow-[0_10px_10px_rgba(0,0,0,0.3)]">
                                <img src="/assets/app_logo.png" alt="App Logo" className="w-20 h-20 object-contain" />
                            </div>

                            {/* Shine effect */}
                            <div className="absolute inset-0 rounded-[2rem] overflow-hidden">
                                <motion.div
                                    className="absolute top-0 left-[-100%] w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
                                    animate={{ left: ['-100%', '200%'] }}
                                    transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                                />
                            </div>
                        </motion.div>

                        <motion.h1
                            className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-orange-100 to-orange-200 mb-2 drop-shadow-sm tracking-tight"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            CHENN-AI
                        </motion.h1>
                        <motion.p
                            className="text-orange-100 text-lg font-medium flex items-center justify-center gap-2"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            The Soul of Chennai
                            <span className="inline-block animate-pulse">🧡</span>
                        </motion.p>
                    </motion.div>

                    {/* Auth card */}
                    <motion.div
                        className="bg-white/10 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-8 border border-white/20 relative overflow-hidden"
                        initial={{ opacity: 0, y: 50, rotateX: 10 }}
                        animate={{ opacity: 1, y: 0, rotateX: 0 }}
                        transition={{ delay: 0.4, duration: 0.8, type: "spring" }}
                    >
                        {/* Glass reflection */}
                        <div className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-gradient-to-b from-white/5 to-transparent rotate-45 pointer-events-none" />

                        {/* Mode Toggle */}
                        {mode !== 'magic' && (
                            <motion.div
                                className="flex gap-1 mb-8 p-1.5 bg-black/20 rounded-2xl backdrop-blur-sm"
                                layout
                            >
                                <motion.button
                                    type="button"
                                    onClick={() => setMode('signin')}
                                    className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all relative overflow-hidden ${mode === 'signin'
                                        ? 'text-white shadow-lg'
                                        : 'text-white/60 hover:text-white hover:bg-white/5'
                                        }`}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {mode === 'signin' && (
                                        <motion.div
                                            className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-600"
                                            layoutId="activeTab"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                    <span className="relative z-10">Sign In</span>
                                </motion.button>
                                <motion.button
                                    type="button"
                                    onClick={() => setMode('signup')}
                                    className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all relative overflow-hidden ${mode === 'signup'
                                        ? 'text-white shadow-lg'
                                        : 'text-white/60 hover:text-white hover:bg-white/5'
                                        }`}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {mode === 'signup' && (
                                        <motion.div
                                            className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-600"
                                            layoutId="activeTab"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                    <span className="relative z-10">Sign Up</span>
                                </motion.button>
                            </motion.div>
                        )}

                        <AnimatePresence mode="wait">
                            {mode === 'magic' ? (
                                /* Magic Link Form */
                                <motion.form
                                    key="magic"
                                    onSubmit={handleMagicLink}
                                    className="space-y-6"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <AnimatedInput delay={0}>
                                        <label htmlFor="email" className="block text-sm font-bold text-orange-100 mb-2 ml-1">
                                            Email Address
                                        </label>
                                        <div className="relative group">
                                            <div className={`absolute inset-0 bg-orange-400/30 rounded-2xl blur-lg transition-opacity duration-300 ${emailFocused ? 'opacity-100' : 'opacity-0'}`} />
                                            <div className="relative">
                                                <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${emailFocused ? 'text-orange-400' : 'text-white/50'}`} />
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    placeholder="your.email@example.com"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    onFocus={() => setEmailFocused(true)}
                                                    onBlur={() => setEmailFocused(false)}
                                                    className="pl-12 pr-4 h-14 text-lg bg-black/20 border-white/10 focus:border-orange-400/50 focus:ring-0 text-white placeholder:text-white/30 rounded-2xl transition-all"
                                                    disabled={loading}
                                                />
                                            </div>
                                        </div>
                                    </AnimatedInput>

                                    <AnimatedInput delay={0.1}>
                                        <RippleButton
                                            type="submit"
                                            className="w-full h-14 text-lg font-bold bg-gradient-to-r from-orange-500 via-red-500 to-purple-600 hover:from-orange-600 hover:via-red-600 hover:to-purple-700 text-white rounded-2xl shadow-lg shadow-orange-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                                                    Sending Magic Link...
                                                </>
                                            ) : (
                                                <div className="flex items-center justify-center gap-2">
                                                    <ChennaiCustomIcons.Sparkles className="w-5 h-5" />
                                                    Send Magic Link
                                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                                </div>
                                            )}
                                        </RippleButton>
                                    </AnimatedInput>

                                    <motion.button
                                        type="button"
                                        onClick={() => setMode('signin')}
                                        className="w-full text-center text-sm text-white/70 hover:text-white font-medium"
                                        whileHover={{ x: -5 }}
                                    >
                                        ← Back to sign in
                                    </motion.button>
                                </motion.form>
                            ) : (
                                /* Email/Password Form */
                                <motion.div
                                    key="emailpass"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <form onSubmit={handleEmailPasswordAuth} className="space-y-5">
                                        {/* Email Input */}
                                        <AnimatedInput delay={0}>
                                            <label htmlFor="email" className="block text-sm font-bold text-orange-100 mb-2 ml-1">
                                                Email Address
                                            </label>
                                            <div className="relative group">
                                                <div className={`absolute inset-0 bg-orange-400/30 rounded-2xl blur-lg transition-opacity duration-300 ${emailFocused ? 'opacity-100' : 'opacity-0'}`} />
                                                <div className="relative">
                                                    <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${emailFocused ? 'text-orange-400' : 'text-white/50'}`} />
                                                    <Input
                                                        id="email"
                                                        type="email"
                                                        placeholder="your.email@example.com"
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                        onFocus={() => setEmailFocused(true)}
                                                        onBlur={() => setEmailFocused(false)}
                                                        className="pl-12 pr-4 h-14 bg-black/20 border-white/10 focus:border-orange-400/50 focus:ring-0 text-white placeholder:text-white/30 rounded-2xl transition-all"
                                                        disabled={loading}
                                                    />
                                                </div>
                                            </div>
                                        </AnimatedInput>

                                        {/* Password Input */}
                                        <AnimatedInput delay={0.1}>
                                            <label htmlFor="password" className="block text-sm font-bold text-orange-100 mb-2 ml-1">
                                                Password
                                            </label>
                                            <div className="relative group">
                                                <div className={`absolute inset-0 bg-orange-400/30 rounded-2xl blur-lg transition-opacity duration-300 ${passwordFocused ? 'opacity-100' : 'opacity-0'}`} />
                                                <div className="relative">
                                                    <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${passwordFocused ? 'text-orange-400' : 'text-white/50'}`} />
                                                    <Input
                                                        id="password"
                                                        type={showPassword ? 'text' : 'password'}
                                                        placeholder="••••••••"
                                                        value={password}
                                                        onChange={(e) => setPassword(e.target.value)}
                                                        onFocus={() => setPasswordFocused(true)}
                                                        onBlur={() => setPasswordFocused(false)}
                                                        className="pl-12 pr-12 h-14 bg-black/20 border-white/10 focus:border-orange-400/50 focus:ring-0 text-white placeholder:text-white/30 rounded-2xl transition-all"
                                                        disabled={loading}
                                                    />
                                                    <motion.button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                                                        whileTap={{ scale: 0.9 }}
                                                    >
                                                        {showPassword ? (
                                                            <EyeOff className="w-5 h-5" />
                                                        ) : (
                                                            <Eye className="w-5 h-5" />
                                                        )}
                                                    </motion.button>
                                                </div>
                                                {mode === 'signup' && (
                                                    <motion.p
                                                        className="text-xs text-orange-200/70 mt-2 ml-1"
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                    >
                                                        Minimum 6 characters
                                                    </motion.p>
                                                )}
                                            </div>
                                        </AnimatedInput>

                                        {/* Submit Button */}
                                        <AnimatedInput delay={0.2}>
                                            <RippleButton
                                                type="submit"
                                                className="w-full h-14 text-lg font-bold bg-gradient-to-r from-orange-500 via-red-500 to-purple-600 hover:from-orange-600 hover:via-red-600 hover:to-purple-700 text-white rounded-2xl shadow-lg shadow-orange-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                                                disabled={loading}
                                            >
                                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                                <div className="relative flex items-center justify-center gap-2">
                                                    {loading ? (
                                                        <>
                                                            <Loader2 className="w-5 h-5 animate-spin" />
                                                            {mode === 'signup' ? 'Creating Account...' : 'Signing In...'}
                                                        </>
                                                    ) : (
                                                        <>
                                                            {mode === 'signup' ? (
                                                                <>
                                                                    Create Account
                                                                    <ChennaiCustomIcons.Celebration className="w-5 h-5" color="white" />
                                                                </>
                                                            ) : (
                                                                <>
                                                                    Sign In
                                                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                                                </>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </RippleButton>
                                        </AnimatedInput>
                                    </form>

                                    {/* Divider */}
                                    <div className="flex items-center gap-4 my-6">
                                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                                        <span className="text-sm text-white/50 font-medium">or continue with</span>
                                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                                    </div>

                                    {/* Google Sign In */}
                                    <AnimatedInput delay={0.3}>
                                        <RippleButton
                                            type="button"
                                            onClick={handleGoogleSignIn}
                                            className="w-full h-14 bg-white hover:bg-gray-50 text-gray-800 rounded-2xl shadow-lg font-bold flex items-center justify-center gap-3 transition-all disabled:opacity-50 group"
                                            disabled={loading}
                                        >
                                            <svg className="w-6 h-6" viewBox="0 0 24 24">
                                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                            </svg>
                                            Google
                                        </RippleButton>
                                    </AnimatedInput>

                                    {/* Magic Link Option */}
                                    <AnimatedInput delay={0.4}>
                                        <motion.button
                                            type="button"
                                            onClick={() => setMode('magic')}
                                            className="w-full mt-4 py-2 text-white/70 hover:text-white text-sm font-medium transition-colors flex items-center justify-center gap-2 group"
                                            whileHover={{ scale: 1.02 }}
                                        >
                                            <ChennaiCustomIcons.Sparkles className="w-4 h-4 text-yellow-300 group-hover:rotate-12 transition-transform" />
                                            Use Magic Link Instead
                                        </motion.button>
                                    </AnimatedInput>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Message */}
                        <AnimatePresence>
                            {message && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10, height: 0 }}
                                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                                    exit={{ opacity: 0, y: -10, height: 0 }}
                                    className={`mt-6 p-4 rounded-xl text-sm font-bold flex items-center gap-3 backdrop-blur-md ${message.type === 'success'
                                        ? 'bg-green-500/20 text-green-100 border border-green-500/30'
                                        : 'bg-red-500/20 text-red-100 border border-red-500/30'
                                        }`}
                                >
                                    {message.type === 'success' && <CheckCircle2 className="w-5 h-5 text-green-400" />}
                                    {message.text}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    {/* Features */}
                    <motion.div
                        className="grid grid-cols-3 gap-4 mb-4 mt-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        {[
                            { icon: Users, label: 'Connect', sublabel: 'Neighbors', delay: 0 },
                            { icon: MapPin, label: 'Local', sublabel: 'Updates', delay: 0.1 },
                            { icon: Zap, label: 'Real-time', sublabel: 'Info', delay: 0.2 },
                        ].map((feature, index) => (
                            <motion.div
                                key={index}
                                className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/10 hover:bg-white/10 transition-colors cursor-default"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.7 + feature.delay }}
                                whileHover={{ scale: 1.05, y: -5 }}
                            >
                                <motion.div
                                    className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-orange-900/20"
                                    whileHover={{ rotate: 360 }}
                                    transition={{ duration: 0.6 }}
                                >
                                    <feature.icon className="w-6 h-6 text-white" />
                                </motion.div>
                                <p className="text-sm font-bold text-white">{feature.label}</p>
                                <p className="text-[10px] text-white/60 mt-1 uppercase tracking-wider">{feature.sublabel}</p>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Footer */}
                    <motion.p
                        className="text-center text-white/40 text-xs font-medium mt-8 flex items-center justify-center gap-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.9 }}
                    >
                        Powered by Chennai Intelligence • Made with
                        <ChennaiCustomIcons.Heart className="w-3 h-3 text-red-400" filled={true} />
                        in Namma Chennai
                    </motion.p>
                </div>
            </div>
        </PageTransition>
    );
}
