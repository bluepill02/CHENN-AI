import { NavLink } from 'react-router-dom';
import { PremiumIcon } from './PremiumIcons';
import { useLanguage } from '../services/LanguageService';
import { motion, AnimatePresence } from 'framer-motion';

export function StreetDock() {
    const { t } = useLanguage();

    const navItems = [
        {
            id: 'home',
            path: '/home',
            icon: 'Community',
            label: t('nav.home', 'Home'),
            color: 'text-auto-yellow',
            bgColor: 'bg-auto-black',
        },
        {
            id: 'services',
            path: '/services',
            icon: 'Auto', // Auto for Services
            label: t('nav.services', 'Services'),
            color: 'text-auto-black',
            bgColor: 'bg-auto-yellow',
        },
        {
            id: 'chat',
            path: '/chat',
            icon: 'Chat', // Tea Glass would be better but using Chat for now
            label: t('nav.chat', 'Chat'),
            color: 'text-white',
            bgColor: 'bg-temple-red',
        },
        {
            id: 'profile',
            path: '/profile',
            icon: 'Profile',
            label: t('nav.profile', 'Gethu'),
            color: 'text-auto-yellow',
            bgColor: 'bg-black',
        },
    ];

    return (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
            <div className="flex items-center gap-4 bg-black/40 backdrop-blur-xl p-2 rounded-full border border-white/10 shadow-2xl relative">
                {/* Neon Glow Background */}
                <div className="absolute inset-0 bg-auto-yellow/20 blur-xl rounded-full -z-10"></div>

                {navItems.map((item) => (
                    <NavLink
                        key={item.id}
                        to={item.path}
                        className="relative group"
                    >
                        {({ isActive }) => (
                            <motion.div
                                className={`relative w-12 h-12 flex items-center justify-center rounded-full transition-all duration-300 ${isActive
                                        ? `${item.bgColor} shadow-[0_0_15px_rgba(255,215,0,0.6)] scale-110 -translate-y-2`
                                        : 'bg-white/10 hover:bg-white/20'
                                    }`}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <PremiumIcon
                                    icon={item.icon as any}
                                    className={`w-5 h-5 ${isActive ? item.color : 'text-gray-400'}`}
                                    color={isActive ? 'currentColor' : '#9ca3af'}
                                    animated={isActive}
                                />

                                <AnimatePresence>
                                    {isActive && (
                                        <motion.div
                                            className="absolute -bottom-8 text-[10px] font-display font-bold text-white bg-black/80 px-2 py-0.5 rounded-full whitespace-nowrap border border-white/10"
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                        >
                                            {item.label}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        )}
                    </NavLink>
                ))}
            </div>
        </div>
    );
}
