-- Function to calculate trust score
CREATE OR REPLACE FUNCTION calculate_trust_score(target_user_id UUID)
RETURNS FLOAT AS $$
DECLARE
    posts_count INTEGER;
    rides_shared INTEGER;
    reviews_given INTEGER;
    base_score FLOAT := 3.0;
    calculated_score FLOAT;
BEGIN
    -- Count posts
    SELECT COUNT(*) INTO posts_count FROM posts WHERE user_id = target_user_id;
    
    -- Count auto shares
    SELECT COUNT(*) INTO rides_shared FROM auto_share_posts WHERE user_id = target_user_id;
    
    -- Count reviews given
    SELECT COUNT(*) INTO reviews_given FROM service_reviews WHERE user_id = target_user_id;
    
    -- Calculate score
    calculated_score := base_score + (posts_count * 0.1) + (rides_shared * 0.2) + (reviews_given * 0.1);
    
    -- Cap at 5.0
    IF calculated_score > 5.0 THEN
        calculated_score := 5.0;
    END IF;
    
    RETURN ROUND(calculated_score::numeric, 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
