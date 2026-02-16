import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ChennaiIcons } from './IllustratedIcon';
import { Coffee, Sparkles, RefreshCw, Loader2, MapPin, Plus, Briefcase, Phone, Star, Calendar, Users, Clock, Trash2, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { CinemaService, type CinemaPost } from '../services/CinemaService';
import { KaapiJobService, type KaapiJob } from '../services/KaapiJobService';
import { EventService, type Event as AppEvent } from '../services/EventService';
import { useAuth } from './auth/SupabaseAuthProvider';
import { Avatar } from './ui/avatar';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useLocation } from '../services/LocationService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import SEO from './SEO';

export function ChennaiGethu() {
    const { user } = useAuth();
    const { currentLocation } = useLocation();

    // SEO Data


    // --- State: Auto Anna ---
    const [autoQuotes] = useState<string[]>([
        "Meter podu, aana manasu sutham!",
        "Life is like a traffic jam, adjust pannitu poga vendiyadhu dhaan.",
        "Chennai la auto otturathu easy illa thambi!",
        "Vaa thala, enga poganum?"
    ]);
    const [quoteIndex, setQuoteIndex] = useState(0);

    // --- State: Cinema Kottai ---
    const [cinemaPosts, setCinemaPosts] = useState<CinemaPost[]>([]);
    const [loadingCinema, setLoadingCinema] = useState(false);
    const [showAddReview, setShowAddReview] = useState(false);
    const [newReview, setNewReview] = useState({
        movie_name: '',
        theater_name: '',
        rating: '5',
        review: '',
        post_type: 'review' as const
    });

    // --- State: Kaapi Jobs ---
    const [jobs, setJobs] = useState<KaapiJob[]>([]);
    const [loadingJobs, setLoadingJobs] = useState(false);
    const [showPostJob, setShowPostJob] = useState(false);
    const [newJob, setNewJob] = useState({
        job_title: '',
        description: '',
        location: '',
        salary_range: '',
        contact_info: ''
    });

    // --- State: Namma Events ---
    const [events, setEvents] = useState<AppEvent[]>([]);
    const [loadingEvents, setLoadingEvents] = useState(false);
    const [eventTab, setEventTab] = useState<'discover' | 'my-plans' | 'hosting'>('discover');
    const [showCreateEvent, setShowCreateEvent] = useState(false);

    // SEO Data (Dependent on events state)
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "itemListElement": events.map((event, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "item": {
                "@type": "Event",
                "name": event.title,
                "startDate": event.date,
                "location": {
                    "@type": "Place",
                    "name": event.location,
                    "address": {
                        "@type": "PostalAddress",
                        "addressLocality": "Chennai",
                        "addressRegion": "TN",
                        "addressCountry": "IN"
                    }
                },
                "description": event.description,
                "organizer": {
                    "@type": "Person",
                    "name": event.profiles?.full_name || "Unknown"
                }
            }
        }))
    };

    const seoData = {
        title: "Chennai Gethu - Events, Cinema & Jobs",
        description: "Discover upcoming events, latest movie reviews, and local job opportunities in Chennai. Celebrate the spirit of Chennai Gethu!",
        canonical: "https://chennai-community.app/chennai-gethu",
        ogType: "website" as const,
        jsonLd
    };

    const [newEvent, setNewEvent] = useState({
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        area: '',
        category: 'Social'
    });

    // --- Effects ---
    useEffect(() => {
        fetchCinemaPosts();
        fetchJobs();
        fetchEvents();

        const subCinema = CinemaService.subscribeToUpdates(() => fetchCinemaPosts());
        const subJobs = KaapiJobService.subscribeToUpdates(() => fetchJobs());
        const subEvents = EventService.subscribeToUpdates(() => fetchEvents());

        return () => {
            CinemaService.unsubscribe(subCinema);
            KaapiJobService.unsubscribe(subJobs);
            EventService.unsubscribe(subEvents);
        };
    }, [currentLocation, user, eventTab]);

    const fetchCinemaPosts = async () => {
        setLoadingCinema(true);
        try {
            const data = await CinemaService.getPosts();
            setCinemaPosts(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingCinema(false);
        }
    };

    const fetchJobs = async () => {
        setLoadingJobs(true);
        try {
            const data = await KaapiJobService.getJobs();
            // Filter by location if available
            const filteredData = currentLocation?.area
                ? data.filter(job =>
                    job.location.toLowerCase().includes(currentLocation.area.toLowerCase()) ||
                    job.location.toLowerCase().includes('chennai')
                )
                : data;
            setJobs(filteredData);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingJobs(false);
        }
    };

    const fetchEvents = async () => {
        setLoadingEvents(true);
        try {
            let data: AppEvent[] = [];
            if (eventTab === 'discover') {
                data = await EventService.getEvents(currentLocation?.area);
            } else if (eventTab === 'my-plans' && user) {
                data = await EventService.getMyEvents(user.id);
            } else if (eventTab === 'hosting' && user) {
                data = await EventService.getOrganizedEvents(user.id);
            }
            setEvents(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingEvents(false);
        }
    };

    // --- Handlers: Cinema Kottai ---
    const handlePostReview = async () => {
        if (!user) {
            toast.error("Please sign in to post reviews!");
            return;
        }
        if (!newReview.movie_name || !newReview.review) {
            toast.error("Please fill in Movie Name and Review!");
            return;
        }

        try {
            await CinemaService.createPost({
                user_id: user.id,
                movie_name: newReview.movie_name,
                theater_name: newReview.theater_name,
                rating: parseInt(newReview.rating),
                review: newReview.review,
                post_type: 'review',
                pincode: '600004', // Default for now
                area: 'Chennai'
            });
            toast.success("Review posted successfully!");
            setShowAddReview(false);
            setNewReview({ movie_name: '', theater_name: '', rating: '5', review: '', post_type: 'review' });
        } catch (error) {
            toast.error("Failed to post review");
        }
    };

    // --- Handlers: Kaapi Jobs ---
    const handlePostJob = async () => {
        if (!user) {
            toast.error("Please sign in to post a job!");
            return;
        }
        if (!newJob.job_title || !newJob.description || !newJob.contact_info) {
            toast.error("Please fill in Job Title, Description, and Contact Info!");
            return;
        }

        try {
            await KaapiJobService.createJob({
                user_id: user.id,
                job_title: newJob.job_title,
                description: newJob.description,
                location: newJob.location,
                salary_range: newJob.salary_range,
                contact_info: newJob.contact_info
            });
            toast.success("Job posted successfully!");
            setShowPostJob(false);
            setNewJob({ job_title: '', description: '', location: '', salary_range: '', contact_info: '' });
        } catch (error) {
            toast.error("Failed to post job");
        }
    };

    // --- Handlers: Namma Events ---
    const handleCreateEvent = async () => {
        if (!user) {
            toast.error("Please sign in to create an event!");
            return;
        }
        if (!newEvent.title || !newEvent.date || !newEvent.location) {
            toast.error("Please fill in Title, Date, and Location!");
            return;
        }

        try {
            const dateTime = new Date(`${newEvent.date}T${newEvent.time || '00:00'}`).toISOString();
            await EventService.createEvent({
                organizer_id: user.id,
                title: newEvent.title,
                description: newEvent.description,
                date: dateTime,
                location: newEvent.location,
                area: newEvent.area || currentLocation?.area || 'Chennai',
                category: newEvent.category
            });
            toast.success("Event created successfully! 🎉");
            setShowCreateEvent(false);
            setNewEvent({ title: '', description: '', date: '', time: '', location: '', area: '', category: 'Social' });
            fetchEvents();
        } catch (error) {
            console.error(error);
            toast.error("Failed to create event");
        }
    };

    const handleJoinEvent = async (eventId: string) => {
        if (!user) {
            toast.error("Please sign in to join events!");
            return;
        }
        try {
            await EventService.joinEvent(eventId, user.id);
            toast.success("You're going! 🎉");
            fetchEvents();
        } catch (error) {
            toast.error("Failed to join event");
        }
    };

    const handleLeaveEvent = async (eventId: string) => {
        if (!user) return;
        try {
            await EventService.leaveEvent(eventId, user.id);
            toast.info("You've left the event.");
            fetchEvents();
        } catch (error) {
            toast.error("Failed to leave event");
        }
    };

    const handleCancelEvent = async (eventId: string) => {
        if (!confirm("Are you sure you want to cancel this event?")) return;
        try {
            await EventService.cancelEvent(eventId);
            toast.success("Event cancelled.");
            fetchEvents();
        } catch (error) {
            toast.error("Failed to cancel event");
        }
    };

    // --- Handlers: Auto Anna ---
    const nextQuote = () => {
        setQuoteIndex((prev) => (prev + 1) % autoQuotes.length);
    };

    return (
        <div className="space-y-6 h-full flex flex-col">
            <SEO {...seoData} />

            <div className="flex items-center justify-between mb-2 shrink-0">
                <h3 className="text-xl font-bold text-[#4B1E1E] flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-orange-500" />
                    Chennai Gethu
                </h3>
                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                    Pride of Chennai
                </Badge>
            </div>

            <Tabs defaultValue="events" className="w-full flex-1 flex flex-col min-h-0">
                <TabsList className="grid w-full grid-cols-4 bg-orange-100/50 p-1 rounded-xl shrink-0">
                    <TabsTrigger value="events" className="data-[state=active]:bg-white data-[state=active]:text-orange-700 rounded-lg text-xs sm:text-sm">
                        🎉 Events
                    </TabsTrigger>
                    <TabsTrigger value="cinema" className="data-[state=active]:bg-white data-[state=active]:text-orange-700 rounded-lg text-xs sm:text-sm">
                        🎬 Cinema
                    </TabsTrigger>
                    <TabsTrigger value="auto" className="data-[state=active]:bg-white data-[state=active]:text-orange-700 rounded-lg text-xs sm:text-sm">
                        🛺 Auto
                    </TabsTrigger>
                    <TabsTrigger value="kaapi" className="data-[state=active]:bg-white data-[state=active]:text-orange-700 rounded-lg text-xs sm:text-sm">
                        ☕ Jobs
                    </TabsTrigger>
                </TabsList>

                <div className="flex-1 overflow-y-auto min-h-0 mt-4 pr-1 scrollbar-thin scrollbar-thumb-orange-200 scrollbar-track-transparent">

                    {/* --- Namma Events --- */}
                    <TabsContent value="events" className="space-y-4 m-0">
                        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                            <Button
                                variant={eventTab === 'discover' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setEventTab('discover')}
                                className={eventTab === 'discover' ? 'bg-orange-600 hover:bg-orange-700' : ''}
                            >
                                Discover
                            </Button>
                            <Button
                                variant={eventTab === 'my-plans' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setEventTab('my-plans')}
                                className={eventTab === 'my-plans' ? 'bg-orange-600 hover:bg-orange-700' : ''}
                            >
                                My Plans
                            </Button>
                            <Button
                                variant={eventTab === 'hosting' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setEventTab('hosting')}
                                className={eventTab === 'hosting' ? 'bg-orange-600 hover:bg-orange-700' : ''}
                            >
                                Hosting
                            </Button>
                            <div className="ml-auto">
                                <Dialog open={showCreateEvent} onOpenChange={setShowCreateEvent}>
                                    <DialogTrigger asChild>
                                        <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                                            <Plus className="w-4 h-4 mr-1" /> Create
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                                        <DialogHeader>
                                            <DialogTitle>Host an Event</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4 py-4">
                                            <div className="space-y-2">
                                                <Label>Event Title</Label>
                                                <Input
                                                    placeholder="e.g. Weekend Cricket Match"
                                                    value={newEvent.title}
                                                    onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Date</Label>
                                                    <Input
                                                        type="date"
                                                        value={newEvent.date}
                                                        onChange={e => setNewEvent({ ...newEvent, date: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Time</Label>
                                                    <Input
                                                        type="time"
                                                        value={newEvent.time}
                                                        onChange={e => setNewEvent({ ...newEvent, time: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Location</Label>
                                                <Input
                                                    placeholder="e.g. Marina Beach"
                                                    value={newEvent.location}
                                                    onChange={e => setNewEvent({ ...newEvent, location: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Category</Label>
                                                <Select
                                                    value={newEvent.category}
                                                    onValueChange={v => setNewEvent({ ...newEvent, category: v })}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select Category" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Sports">Sports 🏏</SelectItem>
                                                        <SelectItem value="Cultural">Cultural 🎭</SelectItem>
                                                        <SelectItem value="Social">Social 🤝</SelectItem>
                                                        <SelectItem value="Food">Food 🍱</SelectItem>
                                                        <SelectItem value="Other">Other ✨</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Description</Label>
                                                <Textarea
                                                    placeholder="Tell us more about the event..."
                                                    value={newEvent.description}
                                                    onChange={e => setNewEvent({ ...newEvent, description: e.target.value })}
                                                />
                                            </div>
                                            <Button className="w-full bg-orange-600" onClick={handleCreateEvent}>
                                                Create Event
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>

                        {loadingEvents ? (
                            <div className="flex justify-center py-10">
                                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                            </div>
                        ) : events.length === 0 ? (
                            <div className="text-center py-10 bg-white/50 rounded-xl border border-dashed border-orange-200">
                                <p className="text-gray-500">No upcoming events. Host one!</p>
                            </div>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2">
                                {events.map((event) => (
                                    <Card key={event.id} className="p-4 bg-white border-2 border-orange-100 hover:border-orange-500 shadow-sm hover:shadow-md transition-all">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-[10px] uppercase tracking-wider">
                                                        {event.category}
                                                    </Badge>
                                                    {event.status === 'cancelled' && (
                                                        <Badge variant="destructive" className="text-[10px]">Cancelled</Badge>
                                                    )}
                                                </div>
                                                <h3 className="font-bold text-lg text-gray-900">{event.title}</h3>
                                                <div className="flex items-center gap-3 text-sm text-gray-500 mt-2">
                                                    <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {new Date(event.date).toLocaleDateString()}</span>
                                                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                                                    <MapPin className="w-4 h-4" /> {event.location}
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <div className="flex items-center gap-1 bg-orange-50 px-2 py-1 rounded-full text-xs font-medium text-orange-700">
                                                    <Users className="w-3 h-3" /> {event.participants_count} Going
                                                </div>
                                            </div>
                                        </div>

                                        <p className="text-sm text-gray-700 mt-3 line-clamp-2">{event.description}</p>

                                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
                                            <div className="flex items-center gap-2">
                                                <Avatar className="w-6 h-6 border border-orange-100">
                                                    <div className="w-full h-full bg-orange-100 flex items-center justify-center text-[10px] font-bold text-orange-700">
                                                        {event.profiles?.full_name?.[0]?.toUpperCase() || 'U'}
                                                    </div>
                                                </Avatar>
                                                <span className="text-xs text-gray-500">Hosted by {event.profiles?.full_name || 'User'}</span>
                                            </div>

                                            <div className="flex gap-2">
                                                {eventTab === 'hosting' ? (
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        className="h-8 text-xs"
                                                        onClick={() => handleCancelEvent(event.id)}
                                                        disabled={event.status === 'cancelled'}
                                                    >
                                                        <Trash2 className="w-3 h-3 mr-1" /> Cancel
                                                    </Button>
                                                ) : (
                                                    event.is_participating ? (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-8 text-xs border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                                            onClick={() => handleLeaveEvent(event.id)}
                                                        >
                                                            <LogOut className="w-3 h-3 mr-1" /> Leave
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            size="sm"
                                                            className="h-8 text-xs bg-orange-600 hover:bg-orange-700 text-white"
                                                            onClick={() => handleJoinEvent(event.id)}
                                                            disabled={event.status === 'cancelled'}
                                                        >
                                                            <Plus className="w-3 h-3 mr-1" /> Join
                                                        </Button>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {/* --- Cinema Kottai --- */}
                    <TabsContent value="cinema" className="space-y-4 m-0">
                        <Card className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-black shadow-[4px_4px_0px_0px_rgba(147,51,234,1)] relative overflow-hidden">
                            <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-multiply" style={{ backgroundImage: 'url("/assets/noise.png")', backgroundRepeat: 'repeat' }}></div>
                            <div className="relative z-10 flex justify-between items-center mb-4">
                                <div>
                                    <h3 className="font-bold text-purple-900">Cinema Kottai</h3>
                                    <p className="text-xs text-purple-600">Latest reviews & updates</p>
                                </div>
                                <Button size="sm" className="bg-purple-600 hover:bg-purple-700" onClick={() => setShowAddReview(!showAddReview)}>
                                    <Plus className="w-4 h-4 mr-1" /> Post Review
                                </Button>
                            </div>

                            {showAddReview && (
                                <Card className="p-4 mb-4 bg-white border-purple-100 animate-in slide-in-from-top-2">
                                    <div className="space-y-3">
                                        <Input
                                            placeholder="Movie Name (e.g. Leo)"
                                            value={newReview.movie_name}
                                            onChange={(e) => setNewReview({ ...newReview, movie_name: e.target.value })}
                                        />
                                        <Input
                                            placeholder="Theater (e.g. Sathyam)"
                                            value={newReview.theater_name}
                                            onChange={(e) => setNewReview({ ...newReview, theater_name: e.target.value })}
                                        />
                                        <Select
                                            value={newReview.rating}
                                            onValueChange={(v) => setNewReview({ ...newReview, rating: v })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Rating" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="5">⭐⭐⭐⭐⭐ (Semma)</SelectItem>
                                                <SelectItem value="4">⭐⭐⭐⭐ (Nalla iruku)</SelectItem>
                                                <SelectItem value="3">⭐⭐⭐ (Ok)</SelectItem>
                                                <SelectItem value="2">⭐⭐ (Mokka)</SelectItem>
                                                <SelectItem value="1">⭐ (Kuppai)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Textarea
                                            placeholder="Your review..."
                                            value={newReview.review}
                                            onChange={(e) => setNewReview({ ...newReview, review: e.target.value })}
                                        />
                                        <Button className="w-full bg-purple-600" onClick={handlePostReview}>
                                            Post Review
                                        </Button>
                                    </div>
                                </Card>
                            )}

                            <div className="space-y-3">
                                {loadingCinema ? (
                                    <div className="flex justify-center p-4"><Loader2 className="animate-spin text-purple-500" /></div>
                                ) : cinemaPosts.length === 0 ? (
                                    <div className="text-center text-gray-500 py-8">No reviews yet. Be the first!</div>
                                ) : (
                                    cinemaPosts.map((post) => (
                                        <Card key={post.id} className="p-3 bg-white border-2 border-purple-100 hover:border-black shadow-sm hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-bold text-gray-900">{post.movie_name}</h4>
                                                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                                        <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-[10px]">
                                                            {post.theater_name || 'Chennai'}
                                                        </Badge>
                                                        <span>• {new Date(post.created_at).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center bg-yellow-100 px-2 py-1 rounded text-xs font-bold text-yellow-700">
                                                    <Star className="w-3 h-3 mr-1 fill-yellow-500 text-yellow-500" />
                                                    {post.rating}/5
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-700 mt-2">{post.review}</p>
                                            <div className="flex items-center gap-2 mt-3 pt-2 border-t border-gray-50">
                                                <Avatar className="w-5 h-5">
                                                    <div className="w-full h-full bg-purple-200 flex items-center justify-center text-[10px] font-bold text-purple-700">
                                                        {post.profiles?.full_name?.[0]?.toUpperCase() || 'U'}
                                                    </div>
                                                </Avatar>
                                                <span className="text-xs text-gray-500">{post.profiles?.full_name || 'Anonymous'}</span>
                                            </div>
                                        </Card>
                                    ))
                                )}
                            </div>
                        </Card>
                    </TabsContent>

                    {/* --- Auto Anna --- */}
                    <TabsContent value="auto" className="space-y-4 m-0">
                        <Card className="p-6 bg-[#FFFBE6] border-2 border-black shadow-[4px_4px_0px_0px_rgba(250,204,21,1)] relative overflow-hidden">
                            <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-multiply" style={{ backgroundImage: 'url("/assets/noise.png")', backgroundRepeat: 'repeat' }}></div>
                            {/* Decorative Background */}
                            <div className="absolute top-0 right-0 pointer-events-none">
                                <img src={ChennaiIcons.mascot_auto} alt="Auto" className="w-32 h-32 object-contain" />
                            </div>

                            <div className="relative z-10 text-center">
                                <div className="w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-black">
                                    <span className="text-4xl">🛺</span>
                                </div>
                                <h3 className="text-xl font-black text-black mb-1">AUTO ANNA SAYS...</h3>
                                <div className="h-1 w-20 bg-black mx-auto mb-6"></div>

                                {autoQuotes.length === 0 ? (
                                    <div className="text-gray-500 mb-6">Auto Anna is sleeping. Come back later!</div>
                                ) : (
                                    <blockquote className="text-lg font-medium text-gray-800 italic mb-6 min-h-[80px] flex items-center justify-center">
                                        "{autoQuotes[quoteIndex]}"
                                    </blockquote>
                                )}

                                <Button
                                    onClick={nextQuote}
                                    className="bg-black text-yellow-400 hover:bg-gray-900 border-2 border-yellow-400 font-bold"
                                    disabled={autoQuotes.length === 0}
                                >
                                    Innoru Quote Sollunga <RefreshCw className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        </Card>
                    </TabsContent>

                    {/* --- Kaapi Jobs --- */}
                    <TabsContent value="kaapi" className="space-y-4 m-0">
                        {/* Kaapi & Careers Card */}
                        <Card className="p-6 bg-[#FFF8F0] border-2 border-black shadow-[4px_4px_0px_0px_rgba(217,119,6,1)] relative overflow-hidden">
                            <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-multiply" style={{ backgroundImage: 'url("/assets/noise.png")', backgroundRepeat: 'repeat' }}></div>
                            <div className="absolute top-4 right-4 opacity-10">
                                <Coffee className="w-12 h-12 text-orange-900" />
                            </div>

                            <div className="relative z-10">
                                <h3 className="text-xl font-bold text-black flex items-center gap-3 mb-4">
                                    <Coffee className="w-6 h-6 text-black" /> Kaapi & Careers
                                </h3>

                                <blockquote className="text-gray-800 italic mb-4 leading-relaxed font-medium">
                                    "No job is small, no effort is wasted. Every role builds our Chennai. Whether you serve kaapi or write code, your work has dignity and value."
                                </blockquote>

                                <p className="text-gray-600 text-sm">
                                    Find part-time gigs, local help, or quick tasks here. Connect over a virtual kaapi!
                                </p>
                            </div>
                        </Card>

                        {/* Hiring Action Card */}
                        <Card
                            className="p-4 bg-white border-2 border-dashed border-orange-300 hover:border-orange-500 cursor-pointer group transition-all"
                            onClick={() => setShowPostJob(!showPostJob)}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                                        <Briefcase className="w-5 h-5 text-orange-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">Hiring? Post a Job</h4>
                                        <p className="text-xs text-gray-500">Find local talent quickly</p>
                                    </div>
                                </div>
                                <div className="text-orange-500 group-hover:scale-110 transition-transform">
                                    <Plus className="w-6 h-6" />
                                </div>
                            </div>
                        </Card>

                        {showPostJob && (
                            <Card className="p-4 mb-4 bg-white border-amber-100 animate-in slide-in-from-top-2">
                                <div className="space-y-3">
                                    <Input
                                        placeholder="Job Title (e.g. Sales Executive)"
                                        value={newJob.job_title}
                                        onChange={(e) => setNewJob({ ...newJob, job_title: e.target.value })}
                                    />
                                    <Input
                                        placeholder="Contact Info (Phone/Email)"
                                        value={newJob.contact_info}
                                        onChange={(e) => setNewJob({ ...newJob, contact_info: e.target.value })}
                                    />
                                    <Textarea
                                        placeholder="Job Description"
                                        value={newJob.description}
                                        onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                                    />
                                    <Input
                                        placeholder="Salary Range"
                                        value={newJob.salary_range}
                                        onChange={(e) => setNewJob({ ...newJob, salary_range: e.target.value })}
                                    />
                                    <Input
                                        placeholder="Location"
                                        value={newJob.location}
                                        onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                                    />

                                    <Button className="w-full bg-amber-700 hover:bg-amber-800" onClick={handlePostJob}>
                                        Post Job
                                    </Button>
                                </div>
                            </Card>
                        )}

                        <div className="space-y-3">
                            {loadingJobs ? (
                                <div className="flex justify-center p-4"><Loader2 className="animate-spin text-amber-600" /></div>
                            ) : jobs.length === 0 ? (
                                <div className="text-center text-gray-500 py-8">No jobs available right now.</div>
                            ) : (
                                jobs.map((job) => (
                                    <Card key={job.id} className="p-3 bg-white border-2 border-amber-100 hover:border-black shadow-sm hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-bold text-gray-900">{job.job_title}</h4>
                                                <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                                                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {job.location || 'Chennai'}</span>
                                                    <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" /> {job.salary_range || 'Negotiable'}</span>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]">
                                                {new Date(job.created_at).toLocaleDateString()}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-gray-700 mt-2 line-clamp-2">{job.description}</p>
                                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-50">
                                            <div className="flex items-center gap-2">
                                                <Avatar className="w-5 h-5">
                                                    <div className="w-full h-full bg-amber-200 flex items-center justify-center text-[10px] font-bold text-amber-800">
                                                        {job.profiles?.full_name?.[0]?.toUpperCase() || 'R'}
                                                    </div>
                                                </Avatar>
                                                <span className="text-xs text-gray-500">{job.profiles?.full_name || 'Recruiter'}</span>
                                            </div>
                                            <Button size="sm" variant="ghost" className="h-7 text-xs text-amber-700 hover:text-amber-800 hover:bg-amber-50" onClick={() => toast.success(`Contact: ${job.contact_info}`)}>
                                                <Phone className="w-3 h-3 mr-1" /> Contact
                                            </Button>
                                        </div>
                                    </Card>
                                ))
                            )}
                        </div>
                    </TabsContent>

                </div>
            </Tabs>
        </div>
    );
}
