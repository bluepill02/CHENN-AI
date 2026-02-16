import { ArrowLeft, Sparkles, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { ChennaiGethu } from './ChennaiGethu';

interface ChennaiGethuScreenProps {
    userLocation?: any;
}

export function ChennaiGethuScreen({ userLocation }: ChennaiGethuScreenProps) {
    const navigate = useNavigate();
    const locationName = userLocation?.area || userLocation?.pincode || 'Chennai';

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-25 pb-20 flex flex-col">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-gradient-to-r from-orange-400 to-orange-500 text-white p-4 shadow-md shrink-0">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(-1)}
                        className="text-white hover:bg-orange-600"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-6 h-6" />
                            <h1 className="text-xl font-bold">Chennai Gethu</h1>
                        </div>
                        <div className="flex items-center gap-1 text-orange-100 text-sm mt-1">
                            <MapPin className="w-3 h-3" />
                            <span>{locationName}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-4 max-w-2xl mx-auto w-full overflow-hidden flex flex-col">
                <ChennaiGethu />
            </div>
        </div>
    );
}
