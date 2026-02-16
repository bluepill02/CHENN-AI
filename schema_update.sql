-- Add phone_number column to auto_share_posts table
ALTER TABLE auto_share_posts 
ADD COLUMN IF NOT EXISTS phone_number TEXT;

-- Comment on column
COMMENT ON COLUMN auto_share_posts.phone_number IS 'Contact phone number for the ride provider';

-- Create food_hunt_likes table
CREATE TABLE IF NOT EXISTS food_hunt_likes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    post_id UUID REFERENCES food_hunt_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(post_id, user_id)
);

-- Add likes column to food_hunt_posts if not exists (as a counter cache)
ALTER TABLE food_hunt_posts ADD COLUMN IF NOT EXISTS likes INTEGER DEFAULT 0;
