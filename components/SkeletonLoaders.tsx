import { Skeleton } from './ui/skeleton';
import { Card } from './ui/card';

export function PostSkeleton() {
    return (
        <Card className="p-4 bg-card backdrop-blur-sm border-orange-200 shadow-md shadow-orange-100/50">
            {/* Header */}
            <div className="flex items-center gap-3 mb-3">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="flex-1">
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-3 w-24" />
                </div>
            </div>

            {/* Content */}
            <div className="space-y-2 mb-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
            </div>

            {/* Image placeholder (optional) */}
            <Skeleton className="h-48 w-full rounded-lg mb-3" />

            {/* Footer actions */}
            <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-20" />
            </div>
        </Card>
    );
}

export function ServiceCardSkeleton() {
    return (
        <Card className="p-4 bg-card backdrop-blur-sm border-orange-200 shadow-md shadow-orange-100/50">
            {/* Icon and title */}
            <div className="flex items-center gap-3 mb-3">
                <Skeleton className="w-12 h-12 rounded-xl" />
                <div className="flex-1">
                    <Skeleton className="h-5 w-32 mb-1" />
                    <Skeleton className="h-3 w-24" />
                </div>
            </div>

            {/* Description */}
            <div className="space-y-2 mb-3">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-4/5" />
            </div>

            {/* Action button */}
            <Skeleton className="h-9 w-full rounded-md" />
        </Card>
    );
}

export function ChatMessageSkeleton() {
    return (
        <div className="flex justify-start mb-4">
            <div className="max-w-xs lg:max-w-md">
                <Skeleton className="h-3 w-20 mb-2" />
                <Skeleton className="h-16 w-64 rounded-2xl" />
                <Skeleton className="h-3 w-16 mt-1" />
            </div>
        </div>
    );
}
