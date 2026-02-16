import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { AnalyticsService } from "../services/AnalyticsService";

export const AnalyticsTracker = () => {
    const location = useLocation();

    useEffect(() => {
        // Track the initial page load and subsequent route changes
        AnalyticsService.trackPageView(location.pathname + location.search);
    }, [location]);

    return null;
};
