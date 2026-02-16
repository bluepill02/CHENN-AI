import ReactGA from "react-ga4";

const MEASUREMENT_ID = "G-C4SW5RZ658";

export const AnalyticsService = {
    initialize: () => {
        ReactGA.initialize(MEASUREMENT_ID);
    },

    trackPageView: (path: string) => {
        ReactGA.send({ hitType: "pageview", page: path });
    },

    trackEvent: (category: string, action: string, label?: string) => {
        ReactGA.event({
            category,
            action,
            label,
        });
    },
};
