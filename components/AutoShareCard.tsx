import { useEffect, useState } from "react";
import rickshawVideo from "../assets/Rickshaw.webm";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

interface AutoSharePost {
  id: string;
  user: string;
  from: string;
  to: string;
  seatsAvailable: number;
  timestamp: string;
  expiresAt: string;
  pincode: string;
}

const STORAGE_KEY = 'autoSharePosts';

export default function AutoShareCard({ pincode }: { pincode: string }) {
  const [posts, setPosts] = useState<AutoSharePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);

  // Load posts from localStorage
  const loadPosts = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const allPosts: AutoSharePost[] = JSON.parse(stored);
        const now = new Date();
        // Filter active posts for this pincode
        const active = allPosts.filter(
          p => p.pincode === pincode && new Date(p.expiresAt) > now
        );
        setPosts(active);
      }
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Save posts to localStorage
  const savePosts = (postsToSave: AutoSharePost[]) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const allPosts: AutoSharePost[] = stored ? JSON.parse(stored) : [];
      
      // Remove expired posts and add/update new ones
      const now = new Date();
      const activePosts = allPosts.filter(p => new Date(p.expiresAt) > now);
      
      // Merge with new posts
      const updatedPosts = [...activePosts];
      postsToSave.forEach(newPost => {
        const existingIndex = updatedPosts.findIndex(p => p.id === newPost.id);
        if (existingIndex >= 0) {
          updatedPosts[existingIndex] = newPost;
        } else {
          updatedPosts.push(newPost);
        }
      });
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPosts));
    } catch (error) {
      console.error('Error saving posts:', error);
    }
  };

  async function fetchPosts() {
    setLoading(true);
    loadPosts();
  }

  async function addPost(e: any) {
    e.preventDefault();
    const form = new FormData(e.target);
    const body = {
      user: form.get("user") as string,
      from: form.get("from") as string,
      to: form.get("to") as string,
      seatsAvailable: Number(form.get("seats")),
      pincode
    };

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 60000); // 30 mins

    const post: AutoSharePost = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      ...body,
      timestamp: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    };

    const updatedPosts = [...posts, post];
    setPosts(updatedPosts);
    savePosts(updatedPosts);
    
    setFormOpen(false);
    // No need to refetch since we updated locally
  }

  useEffect(() => {
    fetchPosts();
    const interval = setInterval(fetchPosts, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, [pincode]);

  return (
    <Card className="p-3 border border-green-200">
      <h4 className="font-medium mb-2">🚖 Auto Share ({pincode})</h4>
      
      <video 
        src={rickshawVideo} 
        autoPlay
        muted
        loop
        playsInline
        onError={() => {/* Optionally handle video load error here */}}
        onLoadedData={() => setVideoError(null)}
      >
        <p>Your browser does not support the video tag or the video failed to load.</p>
      </video>
      {videoError && (
        <div className="text-xs text-red-500 mb-2">{videoError}</div>
      )}
      
      {loading && <div>Loading rides…</div>}

      {!loading && posts.length === 0 && (
        <div className="text-sm text-gray-600">No active rides right now.</div>
      )}

      <ul className="space-y-2">
        {posts.map((p) => (
          <li key={p.id} className="text-sm border-b pb-1">
            <strong>{p.user}</strong>: {p.from} → {p.to} ({p.seatsAvailable} seats)
            <div className="text-xs text-gray-500">
              Posted {new Date(p.timestamp).toLocaleTimeString()}
            </div>
          </li>
        ))}
      </ul>

      <Button className="mt-3" onClick={() => setFormOpen(!formOpen)}>
        {formOpen ? "Cancel" : "Post Ride"}
      </Button>

      {formOpen && (
        <form onSubmit={addPost} className="mt-3 space-y-2">
          <input name="user" placeholder="Your name" className="border p-1 w-full" required />
          <input name="from" placeholder="From" className="border p-1 w-full" required />
          <input name="to" placeholder="To" className="border p-1 w-full" required />
          <input name="seats" type="number" placeholder="Seats available" className="border p-1 w-full" required />
          <Button type="submit" className="w-full">Submit</Button>
        </form>
      )}

      <div className="mt-2 text-xs text-gray-500">
        ⚠️ Posts expire automatically after 30 minutes.
      </div>
    </Card>
  );
}
