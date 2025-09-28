-- Chennai Community App Database Schema
-- PostgreSQL Schema for Users, Posts, Comments, and related data

-- Enable UUID extension for unique identifiers
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) UNIQUE NOT NULL, -- Custom user ID
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    about TEXT,
    location VARCHAR(255),
    avatar_url TEXT,
    phone_number VARCHAR(20),
    is_verified BOOLEAN DEFAULT FALSE,
    trust_score INTEGER DEFAULT 0,
    connections INTEGER DEFAULT 0,
    posts_shared INTEGER DEFAULT 0,
    events_joined INTEGER DEFAULT 0,
    language VARCHAR(10) DEFAULT 'en',
    notifications_enabled BOOLEAN DEFAULT TRUE,
    privacy_level VARCHAR(20) DEFAULT 'public', -- public, neighbors, private
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User badges table (normalized)
CREATE TABLE IF NOT EXISTS user_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    rarity VARCHAR(50) DEFAULT 'common', -- common, rare, epic, legendary
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id VARCHAR(255) UNIQUE NOT NULL, -- Custom post ID
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT,
    content_ta TEXT, -- Tamil content
    content_en TEXT, -- English content
    category VARCHAR(100) NOT NULL,
    category_en VARCHAR(100),
    
    -- Location data
    area VARCHAR(255) NOT NULL,
    area_en VARCHAR(255),
    pincode VARCHAR(10) NOT NULL,
    coordinates_lat DECIMAL(10, 8),
    coordinates_lng DECIMAL(11, 8),
    
    -- Engagement metrics
    likes_count INTEGER DEFAULT 0,
    hearts_count INTEGER DEFAULT 0,
    helpful_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    
    -- Post metadata
    is_urgent BOOLEAN DEFAULT FALSE,
    is_read BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'active', -- active, archived, deleted
    visibility VARCHAR(20) DEFAULT 'public', -- public, neighbors, private
    source VARCHAR(20) DEFAULT 'user', -- user, import, system
    
    -- Media attachments (JSON array)
    media JSONB DEFAULT '[]'::jsonb,
    tags TEXT[] DEFAULT '{}',
    
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Post reactions table (for tracking who liked/reacted)
CREATE TABLE IF NOT EXISTS post_reactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    reaction_type VARCHAR(20) NOT NULL, -- likes, hearts, helpful
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, user_id, reaction_type)
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    comment_id VARCHAR(255) UNIQUE NOT NULL, -- Custom comment ID
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE, -- For nested comments
    
    content TEXT NOT NULL,
    content_ta TEXT,
    content_en TEXT,
    
    -- Author info (denormalized for performance)
    author_name VARCHAR(255) NOT NULL,
    author_avatar TEXT,
    author_trust_score INTEGER DEFAULT 0,
    
    -- Engagement
    likes_count INTEGER DEFAULT 0,
    
    status VARCHAR(20) DEFAULT 'active', -- active, deleted, flagged
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comment reactions table
CREATE TABLE IF NOT EXISTS comment_reactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    reaction_type VARCHAR(20) DEFAULT 'like',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(comment_id, user_id, reaction_type)
);

-- User sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Community metrics table (aggregated stats)
CREATE TABLE IF NOT EXISTS community_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pincode VARCHAR(10) NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    total_users INTEGER DEFAULT 0,
    active_users INTEGER DEFAULT 0,
    total_posts INTEGER DEFAULT 0,
    total_comments INTEGER DEFAULT 0,
    posts_today INTEGER DEFAULT 0,
    
    top_categories JSONB DEFAULT '[]'::jsonb,
    engagement_score DECIMAL(5,2) DEFAULT 0.0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(pincode, date)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_user_id ON users(user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_location ON users(location);
CREATE INDEX IF NOT EXISTS idx_users_last_active ON users(last_active);

CREATE INDEX IF NOT EXISTS idx_posts_post_id ON posts(post_id);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_pincode ON posts(pincode);
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_location ON posts(pincode, area);

-- Text search indexes
CREATE INDEX IF NOT EXISTS idx_posts_content_search ON posts USING GIN (
    to_tsvector('english', coalesce(content, '') || ' ' || coalesce(content_en, ''))
);
CREATE INDEX IF NOT EXISTS idx_posts_content_ta_search ON posts USING GIN (
    to_tsvector('simple', coalesce(content_ta, ''))
);

CREATE INDEX IF NOT EXISTS idx_comments_comment_id ON comments(comment_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at);

CREATE INDEX IF NOT EXISTS idx_post_reactions_post_user ON post_reactions(post_id, user_id);
CREATE INDEX IF NOT EXISTS idx_comment_reactions_comment_user ON comment_reactions(comment_id, user_id);

CREATE INDEX IF NOT EXISTS idx_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON user_sessions(expires_at);

CREATE INDEX IF NOT EXISTS idx_metrics_pincode_date ON community_metrics(pincode, date);

-- Trigger functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_posts_updated_at ON posts;
CREATE TRIGGER update_posts_updated_at 
    BEFORE UPDATE ON posts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_comments_updated_at ON comments;
CREATE TRIGGER update_comments_updated_at 
    BEFORE UPDATE ON comments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Function to update post reaction counts
CREATE OR REPLACE FUNCTION update_post_reaction_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE posts 
        SET 
            likes_count = CASE WHEN NEW.reaction_type = 'likes' THEN likes_count + 1 ELSE likes_count END,
            hearts_count = CASE WHEN NEW.reaction_type = 'hearts' THEN hearts_count + 1 ELSE hearts_count END,
            helpful_count = CASE WHEN NEW.reaction_type = 'helpful' THEN helpful_count + 1 ELSE helpful_count END,
            updated_at = NOW()
        WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts 
        SET 
            likes_count = CASE WHEN OLD.reaction_type = 'likes' THEN likes_count - 1 ELSE likes_count END,
            hearts_count = CASE WHEN OLD.reaction_type = 'hearts' THEN hearts_count - 1 ELSE hearts_count END,
            helpful_count = CASE WHEN OLD.reaction_type = 'helpful' THEN helpful_count - 1 ELSE helpful_count END,
            updated_at = NOW()
        WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply reaction count triggers
DROP TRIGGER IF EXISTS trigger_update_post_reaction_counts ON post_reactions;
CREATE TRIGGER trigger_update_post_reaction_counts
    AFTER INSERT OR DELETE ON post_reactions
    FOR EACH ROW
    EXECUTE FUNCTION update_post_reaction_counts();

-- Function to update comment counts on posts
CREATE OR REPLACE FUNCTION update_post_comment_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE posts 
        SET comments_count = comments_count + 1, updated_at = NOW()
        WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts 
        SET comments_count = comments_count - 1, updated_at = NOW()
        WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply comment count trigger
DROP TRIGGER IF EXISTS trigger_update_post_comment_counts ON comments;
CREATE TRIGGER trigger_update_post_comment_counts
    AFTER INSERT OR DELETE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION update_post_comment_counts();

-- Create admin user for testing
INSERT INTO users (user_id, name, email, location, is_verified, trust_score) 
VALUES ('admin', 'Chennai Admin', 'admin@chennai.app', 'Chennai', true, 100)
ON CONFLICT (user_id) DO NOTHING;