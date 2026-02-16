import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { supabase } from '../../services/supabaseClient';
import { Button } from '../ui/button';
import { MapPin, Loader2, CheckCircle, Search, Sparkles, Home, Bus, Building2, ArrowRight } from 'lucide-react';
import { useAuth } from './SupabaseAuthProvider';
import {
    FloatingElement,
    PageTransition,
    KolamPattern,
    WaveAnimation
} from './AnimationComponents';
import { ChennaiCustomIcons } from '../CustomIcons';
import { PremiumIcon } from '../PremiumIcons';
import { AuthScreenBackground } from '../BackgroundAnimations';

interface PincodeData {
    PostOffice: Array<{
        Name: string;
        Block: string;
        District: string;
        State: string;
        Country: string;
    }>;
}

export function LocationSetupScreen({ onComplete }: { onComplete: () => void }) {
    const { user } = useAuth();
    const [pincode, setPincode] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [error, setError] = useState('');
    const [locationData, setLocationData] = useState<PincodeData | null>(null);
    const [showConfetti, setShowConfetti] = useState(false);
    const [currentFeature, setCurrentFeature] = useState(0);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Auto-rotate feature cards
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentFeature((prev) => (prev + 1) % 3);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const handlePincodeChange = (index: number, value: string) => {
        // Only allow digits
        if (value && !/^\d$/.test(value)) return;

        const newPincode = [...pincode];
        newPincode[index] = value;
        setPincode(newPincode);
        setError('');
        setLocationData(null);

        // Auto-advance to next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-verify when all 6 digits are entered
        const fullPincode = newPincode.join('');
        if (fullPincode.length === 6) {
            verifyPincode(fullPincode);
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !pincode[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        const newPincode = pastedData.split('').concat(Array(6).fill('')).slice(0, 6);
        setPincode(newPincode);

        if (pastedData.length === 6) {
            verifyPincode(pastedData);
        }
    };

    const verifyPincode = async (code: string) => {
        setVerifying(true);
        setError('');

        try {
            const response = await fetch(`https://api.postalpincode.in/pincode/${code}`);

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();

            if (data[0].Status === 'Success') {
                const postOffice = data[0].PostOffice[0];
                const district = postOffice.District;
                const state = postOffice.State;

                const validDistricts = [
                    'chennai',
                    'chengalpattu', 'chengalpet',
                    'kanchipuram', 'kancheepuram',
                    'tiruvallur', 'thiruvallur'
                ];

                const normalizedDistrict = district.toLowerCase();
                const isChennaiRegion = validDistricts.some(d => normalizedDistrict.includes(d));

                if (isChennaiRegion && state === 'Tamil Nadu') {
                    setLocationData(data[0]);
                    setShowConfetti(true);
                    setTimeout(() => setShowConfetti(false), 3000);
                } else {
                    setError('This app is currently available only for Chennai and surrounding areas. 🏛️');
                    setLocationData(null);
                    // Shake animation on error
                    setPincode(['', '', '', '', '', '']);
                    inputRefs.current[0]?.focus();
                }
            } else {
                setError('Invalid pincode. Please enter a valid 6-digit Chennai pincode. 🔍');
                setLocationData(null);
                setPincode(['', '', '', '', '', '']);
                inputRefs.current[0]?.focus();
            }
        } catch (err) {
            console.error('Pincode verification failed:', err);
            setError('Failed to verify pincode. Please check your internet connection. 📡');
            setLocationData(null);
        } finally {
            setVerifying(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const fullPincode = pincode.join('');
        if (!fullPincode || fullPincode.length !== 6) {
            setError('Please enter a valid 6-digit pincode');
            return;
        }

        if (!locationData) {
            setError('Please wait for pincode verification');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const rawName = locationData.PostOffice[0]?.Name || locationData.PostOffice[0]?.Block || 'Chennai';
            const area = rawName.replace(/\s*\(?Chennai\)?/i, '').trim() || rawName;

            const { error: updateError } = await supabase
                .from('profiles')
                .upsert({
                    id: user?.id,
                    area: area,
                    pincode: fullPincode,
                    updated_at: new Date().toISOString(),
                });

            if (updateError) throw updateError;

            localStorage.setItem('user_pincode', fullPincode);
            localStorage.setItem('user_area', area);

            // Delay to show success animation
            setTimeout(() => {
                onComplete();
            }, 1000);
        } catch (err: any) {
            setError(err.message || 'Failed to save location');
        } finally {
            setLoading(false);
        }
    };

    const handleSkip = () => {
        localStorage.setItem('user_pincode', '600004');
        localStorage.setItem('user_area', 'Mylapore');
        onComplete();
    };

    const features = [
        { icon: ChennaiCustomIcons.Community, label: 'Local Posts', sublabel: 'from your area', color: 'from-blue-400 to-blue-600' },
        { icon: ChennaiCustomIcons.Bus, label: 'Bus Updates', sublabel: 'real-time info', color: 'from-green-400 to-green-600' },
        { icon: ChennaiCustomIcons.Temple, label: 'Nearby Temples', sublabel: 'discover places', color: 'from-purple-400 to-purple-600' },
    ];

    return (
        <PageTransition>
            <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden font-sans">
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
                        numberOfPieces={300}
                        gravity={0.3}
                    />
                )}

                {/* Floating Elements */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <FloatingElement delay={0} duration={5} yOffset={25} xOffset={15}>
                        <div className="absolute top-32 left-[10%] opacity-20">
                            <PremiumIcon icon="Location" className="w-24 h-24" color="white" animated={false} />
                        </div>
                    </FloatingElement>

                    <FloatingElement delay={1.5} duration={6} yOffset={30} xOffset={-12}>
                        <div className="absolute top-48 right-[15%] opacity-20">
                            <PremiumIcon icon="Sparkles" className="w-20 h-20" color="#FFED4E" animated={false} />
                        </div>
                    </FloatingElement>
                </div>

                <div className="w-full max-w-md relative z-10">
                    {/* Icon */}
                    <motion.div
                        className="flex justify-center mb-8"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    >
                        <motion.div
                            className="w-28 h-28 bg-white/10 backdrop-blur-md rounded-[2rem] shadow-[0_0_40px_rgba(0,0,0,0.2)] flex items-center justify-center relative overflow-hidden border border-white/20"
                            whileHover={{ scale: 1.1, rotate: 10 }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-400/20 to-purple-500/20" />
                            <PremiumIcon icon="Location" className="w-14 h-14" color="#FFCC00" animated={true} />

                            {/* Pulse effect */}
                            <motion.div
                                className="absolute inset-0 rounded-[2rem] border-2 border-orange-400/50"
                                animate={{
                                    scale: [1, 1.2, 1],
                                    opacity: [1, 0, 1],
                                }}
                                transition={{ duration: 2, repeat: Infinity }}
                            />
                        </motion.div>
                    </motion.div>

                    {/* Title */}
                    <motion.div
                        className="text-center mb-10"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h1 className="text-4xl font-black text-white mb-3 drop-shadow-lg tracking-tight">
                            Where are you?
                        </h1>
                        <p className="text-orange-100 text-lg font-medium">
                            உங்கள் பகுதியை அமைக்கவும் 📍
                        </p>
                    </motion.div>

                    {/* Form Card */}
                    <motion.div
                        className="bg-white/10 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-8 border border-white/20 mb-6 relative overflow-hidden"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-base font-bold text-orange-100 mb-4 text-center">
                                    Enter Chennai Pincode
                                </label>

                                {/* Milestone-style Pincode Input */}
                                <div className="relative bg-yellow-400 p-1 rounded-2xl shadow-xl transform rotate-1 mb-6 border-4 border-black/80">
                                    <div className="bg-black/80 text-white text-xs font-bold text-center py-1 rounded-t-lg uppercase tracking-widest">
                                        Chennai
                                    </div>
                                    <div className="bg-yellow-400 p-4 rounded-b-lg flex gap-2 justify-center" onPaste={handlePaste}>
                                        {pincode.map((digit, index) => (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, scale: 0.5 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: index * 0.05 }}
                                            >
                                                <motion.input
                                                    ref={(el) => (inputRefs.current[index] = el)}
                                                    type="text"
                                                    inputMode="numeric"
                                                    maxLength={1}
                                                    value={digit}
                                                    onChange={(e) => handlePincodeChange(index, e.target.value)}
                                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                                    className="w-10 h-14 text-center text-3xl font-black bg-black/10 border-2 border-black/20 focus:border-black focus:bg-white/20 rounded-lg transition-all shadow-inner text-black placeholder-black/30"
                                                    disabled={loading || verifying}
                                                    animate={error && !digit ? {
                                                        x: [0, -5, 5, -5, 5, 0],
                                                    } : {}}
                                                    transition={{ duration: 0.5 }}
                                                />
                                            </motion.div>
                                        ))}
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 w-full h-full bg-black/20 rounded-2xl -z-10 blur-sm" />
                                </div>

                                {/* Verification Status */}
                                <AnimatePresence mode="wait">
                                    {verifying && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="flex items-center justify-center gap-2 text-orange-200 mb-4"
                                        >
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span className="text-sm font-medium">Verifying pincode...</span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Location Preview */}
                            <AnimatePresence>
                                {locationData && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -20, scale: 0.9 }}
                                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                                        className="p-5 bg-green-500/20 rounded-2xl border border-green-500/30 relative overflow-hidden backdrop-blur-md"
                                    >
                                        <div className="flex items-start gap-3 relative z-10">
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ type: "spring", delay: 0.2 }}
                                            >
                                                <CheckCircle className="w-6 h-6 text-green-400 mt-0.5" />
                                            </motion.div>
                                            <div className="flex-1">
                                                <p className="text-lg font-bold text-white">
                                                    {locationData.PostOffice[0]?.Name || locationData.PostOffice[0]?.Block}
                                                </p>
                                                <p className="text-sm text-green-100/80">
                                                    {locationData.PostOffice[0]?.District}, {locationData.PostOffice[0]?.State}
                                                </p>
                                                <motion.p
                                                    className="text-xs text-green-300 mt-2 font-medium bg-green-900/40 inline-block px-2 py-1 rounded-full"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ delay: 0.4 }}
                                                >
                                                    ✓ Verified Chennai location
                                                </motion.p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Error Message */}
                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="p-4 rounded-2xl bg-red-500/20 text-red-100 text-sm font-bold border border-red-500/30 backdrop-blur-md"
                                    >
                                        {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Submit Button */}
                            <motion.div
                                whileHover={{ scale: locationData && !loading ? 1.02 : 1 }}
                                whileTap={{ scale: locationData && !loading ? 0.98 : 1 }}
                            >
                                <Button
                                    type="submit"
                                    className="w-full h-14 text-lg font-bold bg-gradient-to-r from-orange-500 via-red-500 to-purple-600 hover:from-orange-600 hover:via-red-600 hover:to-purple-700 text-white rounded-2xl shadow-lg shadow-orange-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                                    disabled={loading || !locationData || verifying}
                                >
                                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                    <div className="relative flex items-center justify-center gap-2">
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle className="w-5 h-5" />
                                                Continue to App 🚀
                                            </>
                                        )}
                                    </div>
                                </Button>
                            </motion.div>

                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="w-full text-white/60 hover:text-white hover:bg-white/10 rounded-xl"
                                    onClick={handleSkip}
                                    disabled={loading}
                                >
                                    Skip for now
                                </Button>
                            </motion.div>
                        </form>
                    </motion.div>

                    {/* Feature Carousel */}
                    <motion.div
                        className="relative h-28 mb-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentFeature}
                                initial={{ opacity: 0, x: 100 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -100 }}
                                transition={{ duration: 0.5 }}
                                className="absolute inset-0"
                            >
                                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/10 h-full flex flex-col items-center justify-center">
                                    <motion.div
                                        className={`w-12 h-12 bg-gradient-to-br ${features[currentFeature].color} rounded-xl flex items-center justify-center mx-auto mb-2 shadow-lg`}
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                    >
                                        {React.createElement(features[currentFeature].icon, { className: "w-6 h-6 text-white" })}
                                    </motion.div>
                                    <p className="text-base font-bold text-white">{features[currentFeature].label}</p>
                                    <p className="text-xs text-white/60">{features[currentFeature].sublabel}</p>
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        {/* Progress Dots */}
                        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                            {features.map((_, index) => (
                                <motion.div
                                    key={index}
                                    className={`w-2 h-2 rounded-full ${index === currentFeature ? 'bg-white' : 'bg-white/20'
                                        }`}
                                    animate={{
                                        scale: index === currentFeature ? 1.5 : 1,
                                    }}
                                    transition={{ duration: 0.3 }}
                                />
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </PageTransition>
    );
}
