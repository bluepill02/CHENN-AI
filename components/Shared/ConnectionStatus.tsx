import { AlertTriangle, Loader2, Wifi, WifiOff } from 'lucide-react';
import { useMemo } from 'react';
import { useLanguage } from '../../services/LanguageService';
import { getRelativeTime, getRelativeTimeTamil } from '../../services/RealTimeDataService';
import { Badge } from '../ui/badge';
import { cn } from '../ui/utils';

type StatusType = 'connected' | 'connecting' | 'disconnected' | 'error';

interface ConnectionStatusProps {
  status: StatusType;
  lastUpdate?: Date | string | null;
  className?: string;
  variant?: 'badge' | 'chip';
}

export function ConnectionStatus({
  status,
  lastUpdate,
  className = '',
  variant = 'chip',
}: ConnectionStatusProps) {
  const { language, t } = useLanguage();

  const statusConfig = useMemo(
    () => ({
      connected: {
        icon: <Wifi className="h-3.5 w-3.5" aria-hidden={true} />,
        tone: 'from-green-500/90 to-emerald-500/90 text-white border-green-400/60',
        label: t('connection.connected', language === 'ta' ? 'இணைப்பு செயலில்' : 'Connected'),
      },
      connecting: {
        icon: <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden={true} />,
        tone: 'from-amber-400/90 to-orange-500/90 text-white border-amber-300/70',
        label: t('connection.connecting', language === 'ta' ? 'இணைக்கிறது…' : 'Connecting…'),
      },
      disconnected: {
        icon: <WifiOff className="h-3.5 w-3.5" aria-hidden={true} />,
        tone: 'from-red-500/90 to-rose-500/90 text-white border-red-400/70',
        label: t('connection.disconnected', language === 'ta' ? 'இணைப்பு துண்டிக்கப்பட்டது' : 'Disconnected'),
      },
      error: {
        icon: <AlertTriangle className="h-3.5 w-3.5" aria-hidden={true} />,
        tone: 'from-red-500/90 to-orange-500/90 text-white border-red-500/70',
        label: t('connection.error', language === 'ta' ? 'சிக்கல் ஏற்பட்டுள்ளது' : 'Connection issue'),
      },
    }),
    [language, t],
  );

  const selected = statusConfig[status] ?? statusConfig.connecting;

  const lastUpdateLabel = useMemo(() => {
    if (!lastUpdate) {
      return null;
    }

    const date = lastUpdate instanceof Date ? lastUpdate : new Date(lastUpdate);
    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return language === 'ta' ? getRelativeTimeTamil(date) : getRelativeTime(date);
  }, [language, lastUpdate]);

  if (variant === 'badge') {
    return (
      <Badge
        className={cn(
          'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium shadow-sm',
          selected.tone,
          className,
        )}
      >
        {selected.icon}
        <span>{selected.label}</span>
        {lastUpdateLabel && <span className="text-[10px] text-white/80">· {lastUpdateLabel}</span>}
      </Badge>
    );
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium shadow-sm bg-gradient-to-r',
        selected.tone,
        className,
      )}
      role="status"
      aria-live="polite"
    >
      {selected.icon}
      <span>{selected.label}</span>
      {lastUpdateLabel && (
        <span className="text-xs font-normal text-white/85">
          {language === 'ta'
            ? t('connection.updated', `புதுப்பிக்கப்பட்டது · ${lastUpdateLabel}`)
            : t('connection.updated', `Updated · ${lastUpdateLabel}`)}
        </span>
      )}
    </div>
  );
}
