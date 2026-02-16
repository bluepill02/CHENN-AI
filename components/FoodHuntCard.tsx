import { useEffect, useState, useRef } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { useAuth } from "./auth/SupabaseAuthProvider";
import { FoodHuntService, type FoodHuntPost } from "../services/FoodHuntService";
import { toast } from "sonner";
import { Loader2, Trash2, Image as ImageIcon, X, Heart, Edit2 } from "lucide-react";
import { Textarea } from "./ui/textarea";
import { CustomIcon } from "./CustomIcons";
import { motion } from "framer-motion";

interface FoodHuntCardProps {
    pincode: string;
}

export default function FoodHuntCard({ pincode }: FoodHuntCardProps) {
    const { user } = useAuth();
    const [posts, setPosts] = useState<FoodHuntPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [formOpen, setFormOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [editingPost, setEditingPost] = useState<FoodHuntPost | null>(null);

    // Form fields
    const [restaurantName, setRestaurantName] = useState("");
    const [dishName, setDishName] = useState("");
    const [rating, setRating] = useState(5);
    const [review, setReview] = useState("");
    const [priceRange, setPriceRange] = useState<"cheap" | "moderate" | "expensive">("moderate");
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch posts
    const fetchPosts = async () => {
        try {
            setLoading(true);
            const data = await FoodHuntService.getPosts(pincode);
            setPosts(data);
        } catch (error) {
            console.error("Error fetching food posts:", error);
            toast.error("Failed to load food reviews");
        } finally {
            setLoading(false);
        }
    };

    // Subscribe to real-time updates
    useEffect(() => {
        fetchPosts();

        const unsubscribe = FoodHuntService.subscribeToUpdates(pincode, (payload) => {
            console.log("Real-time update:", payload);
            fetchPosts();
        });

        return () => {
            unsubscribe();
        };
    }, [pincode]);

    // Handle image selection
    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                toast.error("Image size should be less than 5MB");
                return;
            }
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            toast.error("Please sign in to post reviews");
            return;
        }

        if (!restaurantName.trim()) {
            toast.error("Restaurant name is required");
            return;
        }

        try {
            setSubmitting(true);
            let imageUrl = undefined;

            if (selectedImage) {
                const url = await FoodHuntService.uploadImage(selectedImage);
                if (url) {
                    imageUrl = url;
                } else {
                    toast.error("Failed to upload image, posting without it.");
                }
            }

            if (editingPost) {
                await FoodHuntService.updatePost(editingPost.id, {
                    restaurant_name: restaurantName,
                    dish_name: dishName || undefined,
                    rating,
                    review: review || undefined,
                    price_range: priceRange,
                    image_url: imageUrl,
                });
                toast.success("Review updated successfully!");
            } else {
                await FoodHuntService.createPost(
                    {
                        restaurant_name: restaurantName,
                        dish_name: dishName || undefined,
                        rating,
                        review: review || undefined,
                        price_range: priceRange,
                        pincode,
                        image_url: imageUrl,
                    },
                    user.id
                );
                toast.success("Review posted successfully!");
            }
            resetForm();
            setFormOpen(false);
        } catch (error) {
            console.error("Error submitting review:", error);
            toast.error("Failed to submit. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    // Reset form
    const resetForm = () => {
        setRestaurantName("");
        setDishName("");
        setRating(5);
        setReview("");
        setPriceRange("moderate");
        setSelectedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleEdit = (post: FoodHuntPost) => {
        setEditingPost(post);
        setRestaurantName(post.restaurant_name);
        setDishName(post.dish_name || "");
        setRating(post.rating);
        setReview(post.review || "");
        setPriceRange(post.price_range || "moderate");
        setImagePreview(post.image_url || null);
        setFormOpen(true);
    };

    const handleLike = async (post: FoodHuntPost) => {
        if (!user) {
            toast.error("Please sign in to like reviews");
            return;
        }

        // Optimistic update
        const isLiked = post.is_liked_by_user;
        setPosts(posts.map(p =>
            p.id === post.id
                ? { ...p, likes: p.likes + (isLiked ? -1 : 1), is_liked_by_user: !isLiked }
                : p
        ));

        try {
            await FoodHuntService.likePost(post.id, user.id);
        } catch (error) {
            console.error("Error liking post:", error);
            // Revert on error
            fetchPosts();
        }
    };

    // Delete post
    const handleDelete = async (postId: string) => {
        if (!confirm("Are you sure you want to delete this review?")) return;

        try {
            await FoodHuntService.deletePost(postId);
            toast.success("Review deleted");
        } catch (error) {
            toast.error("Failed to delete review");
        }
    };

    const getPriceLabel = (range?: string) => {
        switch (range) {
            case "cheap": return "₹ Budget";
            case "moderate": return "₹₹ Moderate";
            case "expensive": return "₹₹₹ Premium";
            default: return "";
        }
    };

    return (
        <Card className="p-4 border-2 border-black bg-gradient-to-br from-orange-50 to-red-50 shadow-[4px_4px_0px_0px_rgba(234,88,12,1)] rounded-[1.5rem] overflow-hidden relative group">
            {/* Film Grain Overlay */}
            <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-multiply" style={{ backgroundImage: 'url("/assets/noise.png")', backgroundRepeat: 'repeat' }}></div>

            <div className="flex items-center justify-between mb-4 relative z-10">
                <h4 className="font-display font-bold text-xl flex items-center gap-2 text-[#4B1E1E]">
                    <CustomIcon icon="Idli" className="w-7 h-7 text-orange-600 drop-shadow-sm" />
                    Food Hunt
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
                        className={`h-8 text-xs font-medium rounded-full ${formOpen ? "text-orange-700 hover:bg-orange-100" : "bg-orange-500 hover:bg-orange-600 text-white shadow-md border border-black"}`}
                    >
                        {formOpen ? "Cancel" : "Post Review"}
                    </Button>
                )}
            </div>

            {/* Create Form */}
            {formOpen && (
                <form onSubmit={handleSubmit} className="mb-4 space-y-3 p-4 bg-white/90 backdrop-blur-md rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] relative z-10">
                    <div className="text-sm font-bold text-gray-900 flex items-center gap-2 font-display">
                        <CustomIcon icon="FilterCoffee" className="w-4 h-4 text-orange-600" />
                        {editingPost ? "Edit your review" : "Share your food find!"}
                    </div>

                    <div className="space-y-2">
                        <input
                            type="text"
                            placeholder="Restaurant Name (e.g., Murugan Idli Shop)"
                            value={restaurantName}
                            onChange={(e) => setRestaurantName(e.target.value)}
                            className="border-2 border-orange-200 rounded-lg px-3 py-2 w-full text-sm focus:ring-2 focus:ring-orange-500 focus:border-black bg-white transition-all"
                            required
                        />

                        <input
                            type="text"
                            placeholder="Dish Name (optional)"
                            value={dishName}
                            onChange={(e) => setDishName(e.target.value)}
                            className="border-2 border-orange-200 rounded-lg px-3 py-2 w-full text-sm focus:ring-2 focus:ring-orange-500 focus:border-black bg-white transition-all"
                        />
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="text-xs text-gray-600 block mb-1 font-medium">Rating</label>
                            <select
                                value={rating}
                                onChange={(e) => setRating(Number(e.target.value))}
                                className="border-2 border-orange-200 rounded-lg px-3 py-2 w-full text-sm focus:ring-2 focus:ring-orange-500 focus:border-black bg-white transition-all"
                            >
                                <option value={5}>⭐⭐⭐⭐⭐ (5)</option>
                                <option value={4}>⭐⭐⭐⭐ (4)</option>
                                <option value={3}>⭐⭐⭐ (3)</option>
                                <option value={2}>⭐⭐ (2)</option>
                                <option value={1}>⭐ (1)</option>
                            </select>
                        </div>
                        <div className="flex-1">
                            <label className="text-xs text-gray-600 block mb-1 font-medium">Price</label>
                            <select
                                value={priceRange}
                                onChange={(e) => setPriceRange(e.target.value as any)}
                                className="border-2 border-orange-200 rounded-lg px-3 py-2 w-full text-sm focus:ring-2 focus:ring-orange-500 focus:border-black bg-white transition-all"
                            >
                                <option value="cheap">₹ Budget</option>
                                <option value="moderate">₹₹ Moderate</option>
                                <option value="expensive">₹₹₹ Premium</option>
                            </select>
                        </div>
                    </div>

                    <Textarea
                        placeholder="Your review... (e.g., Best sambar in town!)"
                        value={review}
                        onChange={(e) => setReview(e.target.value)}
                        rows={2}
                        className="border-2 border-orange-200 rounded-lg px-3 py-2 w-full text-sm focus:ring-2 focus:ring-orange-500 focus:border-black resize-none bg-white transition-all"
                    />

                    {/* Image Upload */}
                    <div className="space-y-2">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageSelect}
                            className="hidden"
                            ref={fileInputRef}
                        />
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => fileInputRef.current?.click()}
                                className="text-xs border-orange-200 text-orange-700 hover:bg-orange-50"
                            >
                                <ImageIcon className="w-4 h-4 mr-1" />
                                {selectedImage ? "Change Image" : "Add Photo"}
                            </Button>
                            {selectedImage && (
                                <span className="text-xs text-gray-500 truncate max-w-[150px]">
                                    {selectedImage.name}
                                </span>
                            )}
                        </div>

                        {imagePreview && (
                            <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden border border-orange-100">
                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="destructive"
                                    className="absolute top-1 right-1 h-6 w-6 p-0 rounded-full"
                                    onClick={removeImage}
                                >
                                    <X className="w-3 h-3" />
                                </Button>
                            </div>
                        )}
                    </div>

                    <Button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border-2 border-black active:translate-y-[2px] active:shadow-none transition-all"
                        size="sm"
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                Posting...
                            </>
                        ) : (
                            editingPost ? "Update Review" : "Post Review"
                        )}
                    </Button>
                </form>
            )}

            {/* Posts List */}
            <div className="space-y-3 relative z-10">
                {loading ? (
                    <div className="text-center py-6 text-sm text-gray-500">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-orange-500" />
                        Loading reviews...
                    </div>
                ) : posts.length === 0 ? (
                    <div className="text-sm text-gray-600 text-center py-8 bg-white/50 rounded-xl border-2 border-dashed border-orange-200">
                        <CustomIcon icon="Idli" className="w-8 h-8 text-orange-300 mx-auto mb-2" />
                        No food reviews yet.
                        {user && <div className="text-xs mt-1 font-medium text-orange-700">Be the first to recommend!</div>}
                    </div>
                ) : (
                    posts.map((post) => {
                        const isOwner = user?.id === post.user_id;

                        return (
                            <div
                                key={post.id}
                                className="bg-white border-2 border-orange-100 rounded-xl p-4 shadow-sm hover:shadow-[4px_4px_0px_0px_rgba(234,88,12,0.2)] hover:border-orange-300 transition-all duration-300"
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm border border-black">
                                            {post.profiles?.full_name?.charAt(0).toUpperCase() || "U"}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-bold text-sm truncate text-[#4B1E1E] font-display">
                                                {post.restaurant_name}
                                            </div>
                                            <div className="text-xs text-gray-500 flex items-center gap-1">
                                                <span className="text-orange-500 font-medium tracking-wide">
                                                    {"⭐".repeat(post.rating)}
                                                </span>
                                                <span>•</span>
                                                <span className="font-medium text-gray-600">{getPriceLabel(post.price_range)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {isOwner && (
                                        <div className="flex gap-1">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-7 w-7 p-0 text-gray-400 hover:text-blue-500 rounded-full hover:bg-blue-50"
                                                onClick={() => handleEdit(post)}
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-7 w-7 p-0 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50"
                                                onClick={() => handleDelete(post.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                {/* Dish Name */}
                                {post.dish_name && (
                                    <div className="mb-3">
                                        <Badge variant="secondary" className="bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200 text-xs font-medium px-2 py-1">
                                            <CustomIcon icon="Idli" className="w-3 h-3 mr-1" />
                                            {post.dish_name}
                                        </Badge>
                                    </div>
                                )}

                                {/* Image */}
                                {post.image_url && (
                                    <div className="mb-3 rounded-lg overflow-hidden border border-orange-100">
                                        <img src={post.image_url} alt="Food" className="w-full h-48 object-cover" />
                                    </div>
                                )}

                                {/* Review */}
                                {post.review && (
                                    <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100 mb-3 italic">
                                        "{post.review}"
                                    </div>
                                )}

                                {/* Footer */}
                                <div className="flex items-center justify-between pt-2 text-xs text-gray-400 border-t border-gray-50 mt-2">
                                    <div className="flex items-center gap-1">
                                        <CustomIcon icon="LocationPin" className="w-3 h-3 text-orange-400" />
                                        {pincode}
                                    </div>
                                </div>
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleLike(post)}
                                    className={`flex items-center gap-1 text-xs font-medium ${post.is_liked_by_user ? "text-red-500" : "text-gray-400 hover:text-red-500"}`}
                                >
                                    <Heart className={`w-3 h-3 ${post.is_liked_by_user ? "fill-current" : ""}`} />
                                    {post.likes || 0}
                                </motion.button>
                            </div>
                        );
                    })
                )}
            </div>
        </Card >
    );
}
