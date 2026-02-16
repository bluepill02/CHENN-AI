import { NavLink, useLocation } from 'react-router-dom';
import { PremiumIcon } from './PremiumIcons';
import { useLanguage } from '../services/LanguageService';
import { motion } from 'framer-motion';

export function BottomNav() {
  const { t } = useLanguage();
  const location = useLocation();

  const navItems = [
    {
      id: 'home',
      path: '/home',
      icon: 'Community',
      label: t('nav.home', 'Home'),
    },
    {
      id: 'services',
      path: '/services',
      icon: 'Services',
      label: t('nav.services', 'Services'),
    },
    {
      id: 'chat',
      path: '/chat',
      icon: 'Chat',
      label: t('nav.chat', 'Chat'),
    },
    {
      id: 'profile',
      path: '/profile',
      icon: 'Profile',
      label: t('nav.profile', 'Profile'),
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-orange-200 px-4 py-2 flex items-center justify-around z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] rounded-t-[2rem]">
      {/* Traditional pattern border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 via-red-500 to-purple-600"></div>

      {navItems.map((item) => {
        const isActive = location.pathname === item.path;

        return (
          <NavLink
            key={item.id}
            to={item.path}
            className="relative flex-1 flex flex-col items-center justify-center"
          >
            {({ isActive }) => (
              <motion.div
                className={`flex flex-col items-center p-2 rounded-2xl transition-all duration-300 ${isActive
                  ? 'bg-orange-100/50'
                  : 'hover:bg-orange-50/50'
                  }`}
                whileTap={{ scale: 0.9 }}
              >
                <div className="relative">
                  <PremiumIcon
                    icon={item.icon as any}
                    className={`w-6 h-6 transition-all duration-300 ${isActive ? 'text-orange-600 scale-110' : 'text-gray-400'}`}
                    color={isActive ? '#ea580c' : '#9ca3af'}
                    animated={true}
                  />
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute -inset-2 bg-orange-200/30 rounded-full -z-10"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    />
                  )}
                </div>
                <span className={`text-[10px] font-bold mt-1 transition-colors duration-300 ${isActive ? 'text-orange-600' : 'text-gray-400'}`}>
                  {item.label}
                </span>
              </motion.div>
            )}
          </NavLink>
        );
      })}
    </div>
  );
}
