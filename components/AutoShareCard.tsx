import { useEffect, useState } from "react";
import rickshawVideo from "../assets/Rickshaw.webm";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { useAuth } from "./auth/SupabaseAuthProvider";
import { AutoShareService, type AutoSharePost } from "../services/AutoShareService";
import { toast } from "sonner";
import { Clock, Users, Loader2, Edit2, Trash2, Phone, MessageCircle, Car, Bike } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { CustomIcon } from "./CustomIcons";
import { useLanguage } from "../services/LanguageService";
import { AiService } from "../services/AiService";

interface AutoShareCardProps {
  pincode: string;
}

export default function AutoShareCard({ pincode }: AutoShareCardProps) {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [posts, setPosts] = useState<AutoSharePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<AutoSharePost | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [translatedContent, setTranslatedContent] = useState<Record<string, { from: string, to: string, notes: string }>>({});

  useEffect(() => {
    const translateContent = async () => {
      if (language === 'en') {
        setTranslatedContent({});
        return;
      }

      const newTranslations: Record<string, { from: string, to: string, notes: string }> = {};

      await Promise.all(posts.map(async (post) => {
        try {
          const [from, to, notes] = await Promise.all([
            AiService.translate(post.from_location, language),
            AiService.translate(post.to_location, language),
            post.notes ? AiService.translate(post.notes, language) : Promise.resolve('')
          ]);
          newTranslations[post.id] = { from, to, notes };
        } catch (error) {
          console.error(`Failed to translate post ${post.id}:`, error);
        }
      }));

      setTranslatedContent(newTranslations);
    };

    translateContent();
  }, [language, posts]);

  // Form fields
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [seatsAvailable, setSeatsAvailable] = useState(2);
  const [vehicleType, setVehicleType] = useState<"auto" | "car" | "bike">("auto");
  const [notes, setNotes] = useState("");
  const [contactVia, setContactVia] = useState<"chat" | "phone" | "both">("chat");
  const [phoneNumber, setPhoneNumber] = useState("");

  // Fetch posts
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const data = await AutoShareService.getPosts(pincode);
      setPosts(data);
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast.error("Failed to load rides");
    } finally {
      setLoading(false);
    }
  };

  // Subscribe to real-time updates
  useEffect(() => {
    fetchPosts();

    const unsubscribe = AutoShareService.subscribeToUpdates(pincode, (payload) => {
      console.log("Real-time update:", payload);
      // Refetch posts on any change
      fetchPosts();
    });

    return () => {
      unsubscribe();
    };
  }, [pincode]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please sign in to post rides");
      return;
    }

    if (!fromLocation.trim() || !toLocation.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    if ((contactVia === "phone" || contactVia === "both") && !phoneNumber.trim()) {
      toast.error("Please enter your phone number");
      return;
    }

    try {
      setSubmitting(true);

      // Prepend phone number to notes if applicable
      // let finalNotes = notes;
      // if (phoneNumber.trim()) {
      //   finalNotes = `[PHONE:${phoneNumber.trim()}] ${notes}`;
      // }

      if (editingPost) {
        // Update existing post
        await AutoShareService.updatePost(editingPost.id, {
          from_location: fromLocation,
          to_location: toLocation,
          seats_available: seatsAvailable,
          vehicle_type: vehicleType,
          notes: notes || undefined,
          contact_via: contactVia,
          phone_number: phoneNumber.trim() || undefined,
        });
        toast.success("Ride updated successfully!");
      } else {
        // Create new post
        await AutoShareService.createPost(
          {
            from_location: fromLocation,
            to_location: toLocation,
            seats_available: seatsAvailable,
            vehicle_type: vehicleType,
            notes: notes || undefined,
            pincode,
            contact_via: contactVia,
            phone_number: phoneNumber.trim() || undefined,
          },
          user.id
        );
        toast.success("Ride posted successfully!");
      }

      // Reset form
      resetForm();
      setFormOpen(false);
    } catch (error) {
      console.error("Error submitting ride:", error);
      toast.error("Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFromLocation("");
    setToLocation("");
    setSeatsAvailable(2);
    setVehicleType("auto");
    setNotes("");
    setContactVia("chat");
    setPhoneNumber("");
    setEditingPost(null);
  };

  // Edit post
  const handleEdit = (post: AutoSharePost) => {
    setEditingPost(post);
    setFromLocation(post.from_location);
    setToLocation(post.to_location);
    setSeatsAvailable(post.seats_available);
    setVehicleType(post.vehicle_type);

    // Extract phone number from notes if present
    // let currentNotes = post.notes || "";
    // let currentPhone = "";
    // const phoneMatch = currentNotes.match(/\[PHONE:(.*?)\]/);
    // if (phoneMatch) {
    //   currentPhone = phoneMatch[1];
    //   currentNotes = currentNotes.replace(phoneMatch[0], "").trim();
    // }

    setNotes(post.notes || "");
    setPhoneNumber(post.phone_number || "");
    setContactVia(post.contact_via);
    setFormOpen(true);
  };

  // Delete post
  const handleDelete = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this ride?")) return;

    try {
      await AutoShareService.deletePost(postId);
      toast.success("Ride deleted");
    } catch (error) {
      toast.error("Failed to delete ride");
    }
  };

  // Mark as filled
  const handleMarkFilled = async (postId: string) => {
    try {
      await AutoShareService.markAsFilled(postId);
      toast.success("Ride marked as filled");
    } catch (error) {
      toast.error("Failed to update ride");
    }
  };

  // Calculate time remaining
  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 0) return "Expired";
    if (minutes < 5) return `${minutes}m (Expiring soon!)`;
    return `${minutes}m remaining`;
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700 border-green-200";
      case "filled":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "cancelled":
        return "bg-gray-100 text-gray-700 border-gray-200";
      case "expired":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  // Helper to extract phone and clean notes for display
  // const parsePostContent = (notes?: string) => {
  //   if (!notes) return { phone: null, cleanNotes: null };
  //   const phoneMatch = notes.match(/\[PHONE:(.*?)\]/);
  //   const phone = phoneMatch ? phoneMatch[1] : null;
  //   const cleanNotes = notes.replace(/\[PHONE:.*?\]/, "").trim();
  //   return { phone, cleanNotes };
  // };

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case 'car': return <Car className="w-7 h-7 text-green-700 drop-shadow-sm" />;
      case 'bike': return <Bike className="w-7 h-7 text-green-700 drop-shadow-sm" />;
      default: return <CustomIcon icon="AutoRickshaw" className="w-7 h-7 text-green-700 drop-shadow-sm" />;
    }
  };

  return (
    <Card className="p-4 border-2 border-black bg-gradient-to-br from-green-50 to-emerald-50 shadow-[4px_4px_0px_0px_rgba(22,163,74,1)] rounded-[1.5rem] overflow-hidden relative group">
      {/* Film Grain Overlay */}
      <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-multiply" style={{ backgroundImage: 'url("/assets/noise.png")', backgroundRepeat: 'repeat' }}></div>

      <div className="flex items-center justify-between mb-4 relative z-10">
        <h4 className="font-display font-bold text-xl flex items-center gap-2 text-[#4B1E1E]">
          {getVehicleIcon(vehicleType)}
          Auto Share
          <Badge variant="outline" className="text-xs border-2 border-black bg-white font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)]">
            {pincode}
          </Badge>
        </h4>
        {user && (
          <Button
            size="sm"
            onClick={() => {
              resetForm();
              setFormOpen(!formOpen);
            }}
            variant={formOpen ? "ghost" : "default"}
            className={`h-8 text-xs font-medium rounded-full ${formOpen ? "text-green-700 hover:bg-green-100" : "bg-green-600 hover:bg-green-700 text-white shadow-md border border-black"}`}
          >
            {formOpen ? "Cancel" : "Post Ride"}
          </Button>
        )}
      </div>

      {/* Video */}
      <div className="relative rounded-xl overflow-hidden mb-4 shadow-md border-2 border-black relative z-10">
        <video
          src={rickshawVideo}
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-32 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
          <p className="text-white text-xs font-medium font-display tracking-wide">Find or share an auto ride instantly!</p>
        </div>
      </div>

      {/* Create/Edit Form */}
      {formOpen && (
        <form onSubmit={handleSubmit} className="mb-4 space-y-3 p-4 bg-white/90 backdrop-blur-md rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] relative z-10">
          <div className="text-sm font-bold text-gray-900 flex items-center gap-2 font-display">
            <CustomIcon icon="Sparkles" className="w-4 h-4 text-green-500" />
            {editingPost ? "Edit Ride" : "Post New Ride"}
          </div>

          <div className="space-y-2">
            <input
              type="text"
              placeholder="From (e.g., T. Nagar)"
              value={fromLocation}
              onChange={(e) => setFromLocation(e.target.value)}
              className="border-2 border-green-200 rounded-lg px-3 py-2 w-full text-sm focus:ring-2 focus:ring-green-500 focus:border-black bg-white transition-all"
              required
            />

            <input
              type="text"
              placeholder="To (e.g., Anna Nagar)"
              value={toLocation}
              onChange={(e) => setToLocation(e.target.value)}
              className="border-2 border-green-200 rounded-lg px-3 py-2 w-full text-sm focus:ring-2 focus:ring-green-500 focus:border-black bg-white transition-all"
              required
            />
          </div>

          <div>
            <label className="text-xs text-gray-600 block mb-1 font-medium">Seats Available</label>
            <input
              type="number"
              min="1"
              max="10"
              value={seatsAvailable}
              onChange={(e) => setSeatsAvailable(Number(e.target.value))}
              className="border-2 border-green-200 rounded-lg px-3 py-2 w-full text-sm focus:ring-2 focus:ring-green-500 focus:border-black bg-white transition-all"
              required
            />
          </div>

          <div>
            <label className="text-xs text-gray-600 block mb-1 font-medium">Vehicle Type</label>
            <RadioGroup
              value={vehicleType}
              onValueChange={(val: "auto" | "car" | "bike") => setVehicleType(val)}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="auto" id="auto" className="text-green-600 border-green-600" />
                <Label htmlFor="auto" className="text-xs">Auto</Label>
              </div>
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="car" id="car" className="text-green-600 border-green-600" />
                <Label htmlFor="car" className="text-xs">Car</Label>
              </div>
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="bike" id="bike" className="text-green-600 border-green-600" />
                <Label htmlFor="bike" className="text-xs">Bike</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <label className="text-xs text-gray-600 block mb-1 font-medium">Contact Method</label>
            <RadioGroup
              value={contactVia}
              onValueChange={(val: "chat" | "phone" | "both") => setContactVia(val)}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="chat" id="chat" className="text-green-600 border-green-600" />
                <Label htmlFor="chat" className="text-xs">Chat</Label>
              </div>
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="phone" id="phone" className="text-green-600 border-green-600" />
                <Label htmlFor="phone" className="text-xs">Phone</Label>
              </div>
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="both" id="both" className="text-green-600 border-green-600" />
                <Label htmlFor="both" className="text-xs">Both</Label>
              </div>
            </RadioGroup>
          </div>

          {(contactVia === "phone" || contactVia === "both") && (
            <input
              type="tel"
              placeholder="Phone Number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="border-2 border-green-200 rounded-lg px-3 py-2 w-full text-sm focus:ring-2 focus:ring-green-500 focus:border-black bg-white transition-all"
              required
            />
          )}

          <textarea
            placeholder="Additional notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="border-2 border-green-200 rounded-lg px-3 py-2 w-full text-sm focus:ring-2 focus:ring-green-500 focus:border-black resize-none bg-white transition-all"
          />

          <Button
            type="submit"
            disabled={submitting}
            className="w-full bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border-2 border-black active:translate-y-[2px] active:shadow-none transition-all"
            size="sm"
          >
            {submitting ? (
              <>
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                {editingPost ? "Updating..." : "Posting..."}
              </>
            ) : editingPost ? (
              "Update Ride"
            ) : (
              "Post Ride"
            )}
          </Button>
        </form>
      )}

      {/* Posts List */}
      <div className="space-y-3 relative z-10">
        {loading ? (
          <div className="text-center py-6 text-sm text-gray-500">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-green-500" />
            Loading rides...
          </div>
        ) : posts.length === 0 ? (
          <div className="text-sm text-gray-600 text-center py-8 bg-white/50 rounded-xl border-2 border-dashed border-green-300">
            <CustomIcon icon="AutoRickshaw" className="w-8 h-8 text-green-300 mx-auto mb-2" />
            No active rides right now.
            {user && <div className="text-xs mt-1 font-medium text-green-700">Be the first to post!</div>}
          </div>
        ) : (
          posts.map((post) => {
            const isOwner = user?.id === post.user_id;
            const timeRemaining = getTimeRemaining(post.expires_at);
            // const { phone, cleanNotes } = parsePostContent(post.notes);
            const phone = post.phone_number;
            const cleanNotes = post.notes;

            return (
              <div
                key={post.id}
                className="bg-white border-2 border-green-100 rounded-xl p-4 shadow-sm hover:shadow-[4px_4px_0px_0px_rgba(22,163,74,0.2)] hover:border-green-300 transition-all duration-300"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm border border-black">
                      {post.profiles?.full_name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm truncate text-[#4B1E1E] font-display">
                        {post.profiles?.full_name || "Anonymous"}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-green-500" />
                        {timeRemaining}
                      </div>
                    </div>
                  </div>

                  <Badge className={`${getStatusColor(post.status)} text-xs px-2 py-0.5 rounded-full border border-black/10`}>
                    {post.status}
                  </Badge>
                </div>

                {/* Route */}
                <div className="mb-3 bg-green-50/50 p-2 rounded-lg border border-green-100">
                  <div className="flex items-center gap-2 text-sm">
                    <CustomIcon icon="LocationPin" className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="font-semibold truncate text-gray-800">
                      {translatedContent[post.id]?.from || post.from_location}
                    </span>
                    <span className="text-green-400 font-bold">→</span>
                    <span className="font-semibold truncate text-gray-800">
                      {translatedContent[post.id]?.to || post.to_location}
                    </span>
                  </div>
                </div>

                {/* Seats */}
                <div className="flex items-center gap-2 text-sm text-gray-700 mb-3">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">
                    {post.seats_available} {post.seats_available === 1 ? "seat" : "seats"} available
                  </span>
                </div>

                {/* Notes */}
                {cleanNotes && (
                  <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100 mb-3 italic">
                    "{translatedContent[post.id]?.notes || cleanNotes}"
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="text-xs text-gray-400 font-medium">
                    {post.views_count} {post.views_count === 1 ? "view" : "views"}
                  </div>

                  {isOwner ? (
                    <div className="flex items-center gap-1">
                      {post.status === "active" && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
                            onClick={() => handleEdit(post)}
                          >
                            <Edit2 className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-xs text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg"
                            onClick={() => handleMarkFilled(post.id)}
                          >
                            <CustomIcon icon="CheckCircle" className="w-3 h-3 mr-1" />
                            Filled
                          </Button>
                        </>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                        onClick={() => handleDelete(post.id)}
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  ) : (
                    post.status === "active" && (
                      <div className="flex gap-2">
                        {(post.contact_via === "chat" || post.contact_via === "both") && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs px-3 rounded-lg border-green-200 text-green-700 hover:bg-green-50"
                            onClick={() => toast.success(`Request sent to ${post.profiles?.full_name || 'user'}!`)}
                          >
                            <MessageCircle className="w-3 h-3 mr-1" />
                            Chat
                          </Button>
                        )}
                        {(post.contact_via === "phone" || post.contact_via === "both") && phone && (
                          <Button
                            size="sm"
                            className="h-8 text-xs px-3 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-sm"
                            onClick={() => window.location.href = `tel:${phone}`}
                          >
                            <Phone className="w-3 h-3 mr-1" />
                            Call
                          </Button>
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Info */}
      <div className="mt-4 text-xs text-gray-500 flex items-start gap-2 bg-yellow-50/80 p-3 rounded-xl border border-yellow-100 relative z-10">
        <span className="text-lg">⚠️</span>
        <span className="mt-0.5">Posts expire automatically after 30 minutes. {!user && "Sign in to post rides."}</span>
      </div>
    </Card>
  );
}
