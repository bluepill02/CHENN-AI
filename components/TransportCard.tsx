import { useEffect, useState } from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { TransportService, type TransportData } from "../services/TransportService";
import { Bus, Train, ExternalLink, MapPin, Clock } from "lucide-react";

interface TransportCardProps {
    pincode: string;
}

export default function TransportCard({ pincode }: TransportCardProps) {
    const [data, setData] = useState<TransportData | null>(null);
    // const [activeTab, setActiveTab] = useState("bus"); // Removed unused state

    useEffect(() => {
        const transportData = TransportService.getTransportData(pincode);
        setData(transportData);
    }, [pincode]);

    if (!data) {
        return (
            <Card className="p-4 bg-gray-50 border-dashed border-2 border-gray-200 text-center text-gray-500">
                No transport info found for {pincode}
            </Card>
        );
    }

    const handleTwitterSearch = (query: string) => {
        window.open(`https://twitter.com/search?q=${encodeURIComponent(query)}&f=live`, '_blank');
    };

    return (
        <Card className="p-0 overflow-hidden border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white">
            <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
                <h3 className="font-display font-bold text-lg flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Transport Info
                </h3>
                <Badge className="bg-white text-blue-600 font-bold border-2 border-black">
                    {pincode}
                </Badge>
            </div>

            <Tabs defaultValue="bus" className="w-full">
                <TabsList className="w-full grid grid-cols-3 rounded-none border-b-2 border-black p-0 h-12 bg-gray-100">
                    <TabsTrigger
                        value="bus"
                        className="rounded-none h-full data-[state=active]:bg-white data-[state=active]:text-blue-600 font-bold border-r-2 border-black last:border-r-0"
                    >
                        <Bus className="w-4 h-4 mr-2" />
                        Bus Stops
                    </TabsTrigger>
                    <TabsTrigger
                        value="metro"
                        className="rounded-none h-full data-[state=active]:bg-white data-[state=active]:text-green-600 font-bold border-r-2 border-black last:border-r-0"
                    >
                        <Train className="w-4 h-4 mr-2" />
                        Metro
                    </TabsTrigger>
                    <TabsTrigger
                        value="train"
                        className="rounded-none h-full data-[state=active]:bg-white data-[state=active]:text-orange-600 font-bold"
                    >
                        <Train className="w-4 h-4 mr-2" />
                        Train
                    </TabsTrigger>
                </TabsList>

                <div className="p-4 bg-[#fffdf5] min-h-[200px]">
                    <TabsContent value="bus" className="mt-0 space-y-4">
                        <div>
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nearby Stops</h4>
                            <div className="space-y-2">
                                {data.busStops.map((stop, i) => (
                                    <div key={i} className="flex items-center gap-2 p-2 bg-white border border-blue-100 rounded-lg shadow-sm">
                                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                        <span className="font-medium text-gray-800">{stop}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {data.popularRoutes && data.popularRoutes.length > 0 && (
                            <div>
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Popular Routes</h4>
                                <div className="flex flex-wrap gap-2">
                                    {data.popularRoutes.map((route, i) => (
                                        <Badge key={i} className="bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200">
                                            {route}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {data.twitterQueries.length > 0 && (
                            <div className="pt-2 border-t border-gray-200">
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Live Updates</h4>
                                <Button
                                    onClick={() => handleTwitterSearch(data.twitterQueries[0])}
                                    className="w-full bg-black text-white hover:bg-gray-800"
                                    size="sm"
                                >
                                    <ExternalLink className="w-3 h-3 mr-2" />
                                    Check Traffic on X
                                </Button>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="metro" className="mt-0">
                        {data.metroStation ? (
                            <div className="space-y-4">
                                <div className="p-3 bg-green-50 border border-green-200 rounded-xl">
                                    <div className="text-xs text-green-700 font-bold uppercase mb-1">Nearest Station</div>
                                    <div className="text-xl font-display font-bold text-green-800 flex items-center gap-2">
                                        <Train className="w-5 h-5" />
                                        {data.metroStation.name}
                                    </div>
                                    <Badge className={`mt-2 ${data.metroStation.line === 'Blue Line' ? 'bg-blue-500' : 'bg-green-500'
                                        } text-white border-black`}>
                                        {data.metroStation.line}
                                    </Badge>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Frequency</h4>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div className="bg-white p-2 rounded border border-gray-200">
                                            <div className="text-gray-500 text-xs">Peak Hours</div>
                                            <div className="font-bold">~7 mins</div>
                                        </div>
                                        <div className="bg-white p-2 rounded border border-gray-200">
                                            <div className="text-gray-500 text-xs">Non-Peak</div>
                                            <div className="font-bold">~15 mins</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                                    <Clock className="w-3 h-3" />
                                    <span>First: 04:51 AM • Last: 11:00 PM</span>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <Train className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                No metro station found near this pincode.
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="train" className="mt-0">
                        {data.trainStation ? (
                            <div className="space-y-4">
                                <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl">
                                    <div className="text-xs text-orange-700 font-bold uppercase mb-1">Nearest Station</div>
                                    <div className="text-xl font-display font-bold text-orange-800 flex items-center gap-2">
                                        <Train className="w-5 h-5" />
                                        {data.trainStation.name}
                                    </div>
                                    <Badge className="mt-2 bg-orange-500 text-white border-black">
                                        {data.trainStation.line}
                                    </Badge>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Frequency</h4>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div className="bg-white p-2 rounded border border-gray-200">
                                            <div className="text-gray-500 text-xs">Peak Hours</div>
                                            <div className="font-bold">~10 mins</div>
                                        </div>
                                        <div className="bg-white p-2 rounded border border-gray-200">
                                            <div className="text-gray-500 text-xs">Non-Peak</div>
                                            <div className="font-bold">~20 mins</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <Train className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                No suburban train station found near this pincode.
                            </div>
                        )}
                    </TabsContent>
                </div>
            </Tabs>
        </Card >
    );
}
