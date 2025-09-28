import { AlertTriangle, CheckCircle, Info, ShieldAlert } from 'lucide-react';
import type { ReactElement } from 'react';
import type { LiveAlert } from '../../types/community';
import { Button } from '../ui/button';

interface LiveAlertsPanelProps {
  alerts: LiveAlert[];
  loading?: boolean;
  error?: string | null;
  className?: string;
  onAcknowledge?: (alertId: string) => void;
  emptyMessage?: string;
  heading?: string | null;
  showSummary?: boolean;
  summaryFormatter?: (count: number) => string;
}

const severityConfig: Record<LiveAlert['severity'], {
  icon: ReactElement;
  badge: string;
  classes: string;
}> = {
  critical: {
    icon: <ShieldAlert className="w-4 h-4 text-red-600" />,
    badge: 'Critical',
    classes: 'border-red-300 bg-red-50/90',
  },
  high: {
    icon: <AlertTriangle className="w-4 h-4 text-orange-600" />,
    badge: 'High',
    classes: 'border-orange-300 bg-orange-50/90',
  },
  medium: {
    icon: <Info className="w-4 h-4 text-blue-600" />,
    badge: 'Medium',
    classes: 'border-blue-300 bg-blue-50/90',
  },
  low: {
    icon: <CheckCircle className="w-4 h-4 text-emerald-600" />,
    badge: 'Low',
    classes: 'border-emerald-300 bg-emerald-50/90',
  },
};

const defaultSummaryFormatter = (count: number) => (count > 0 ? `${count} active` : 'All clear');

function formatTimestamp(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function LiveAlertsPanel({
  alerts,
  loading,
  error,
  className = '',
  onAcknowledge,
  emptyMessage = 'No active alerts for your area right now.',
  heading = 'Live Alerts',
  showSummary = true,
  summaryFormatter = defaultSummaryFormatter,
}: LiveAlertsPanelProps) {
  const hasHeading = heading !== null && heading !== '';
  const shouldRenderHeader = hasHeading || showSummary;
  const summaryText = summaryFormatter(alerts.length);

  return (
    <div className={`space-y-3 ${className}`}>
      {shouldRenderHeader && (
        <div className="mb-2 flex items-center justify-between">
          {hasHeading ? (
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-orange-500" />
              {heading}
            </h3>
          ) : (
            <span />
          )}
          {showSummary && (
            <span className="text-xs text-gray-500">{summaryText}</span>
          )}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50/80 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading && (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-16 animate-pulse rounded-lg border border-orange-100 bg-orange-50/60"
            />
          ))}
        </div>
      )}

      {!loading && alerts.length === 0 && !error && (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white/70 px-4 py-6 text-center text-sm text-gray-600">
          {emptyMessage}
        </div>
      )}

      {!loading &&
        alerts.map(alert => {
          const config = severityConfig[alert.severity];
          return (
            <div
              key={alert.id}
              className={`rounded-xl border px-4 py-3 shadow-sm transition-all hover:shadow-md ${config.classes}`}
            >
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/70">
                  {config.icon}
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">
                        {alert.title}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {alert.title !== alert.titleEn ? alert.titleEn : alert.messageEn}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="rounded-full bg-white/60 px-2 py-0.5 font-medium text-gray-700">
                        {config.badge}
                      </span>
                      <span>{formatTimestamp(alert.timestamp)}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700">{alert.message}</p>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
                    {alert.source && (
                      <span className="rounded-full bg-white/70 px-2 py-1 font-medium text-gray-700">
                        📡 {alert.source}
                      </span>
                    )}
                    {alert.affectedAreas?.map(area => (
                      <span key={area} className="rounded-full bg-white/70 px-2 py-1">
                        📍 {area}
                      </span>
                    ))}
                    {alert.pincodes?.map(code => (
                      <span key={code} className="rounded-full bg-white/50 px-2 py-1">
                        PIN {code}
                      </span>
                    ))}
                  </div>
                </div>
                {onAcknowledge && alert.isActive && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-white/60 bg-white/70 text-gray-700 hover:bg-white"
                    onClick={() => onAcknowledge(alert.id)}
                  >
                    Mark read
                  </Button>
                )}
              </div>
            </div>
          );
        })}
    </div>
  );
}