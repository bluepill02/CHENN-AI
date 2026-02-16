import { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'ta' | 'ta-rom';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation data
const translations = {
  en: {
    // Welcome Screen
    'welcome.title': 'Welcome to Chennai Community',
    'welcome.subtitle': 'Connect with your neighbors, discover local services, and build stronger communities',
    'welcome.tagline': 'Your trusted neighborhood network',
    'welcome.continue': 'Continue',

    // Pincode Verification
    'pincode.title': 'Verify Your Location',
    'pincode.subtitle': 'Enter your pincode to connect with your local community',
    'pincode.placeholder': 'Enter Chennai pincode',
    'pincode.verify': 'Verify Location',
    'pincode.skip': 'Skip for now',
    'pincode.trust': 'Trust & Safety',
    'pincode.privacy': 'Your location data is encrypted and only used to connect you with nearby neighbors',

    // Bottom Navigation
    'nav.home': 'Home',
    'nav.services': 'Services',
    'nav.chat': 'Chat',
    'nav.profile': 'Profile',

    // Community Feed
    'feed.title': 'Community Feed',
    'feed.subtitle': 'See what\'s happening in your neighborhood',
    'feed.whatsHappening': 'What\'s happening in your area?',
    'feed.share': 'Share',
    'feed.viewComments': 'View Comments',
    'feed.like': 'Like',

    // Local Services
    'services.title': 'Local Services',
    'services.subtitle': 'Trusted services from your community',
    'services.verified': 'Verified',
    'services.viewAll': 'View All',
    'services.book': 'Book Service',
    'services.contact': 'Contact',

    // Chat
    'chat.title': 'Chat',
    'chat.subtitle': 'Stay connected with your community',
    'chat.keyboard': 'Tamil keyboard supported',
    'chat.joinGroups': 'Join Groups',
    'chat.startChat': 'Start Chat',
    'chat.announcements': 'Announcements',
    'chat.placeholder': 'Type your message...',
    'chat.active': 'Active now',
    'chat.members': 'members',
    'chat.official': 'Official',

    // Profile
    'profile.trustScore': 'Trust Score',
    'profile.connections': 'Connections',
    'profile.postsShared': 'Posts Shared',
    'profile.eventsJoined': 'Events Joined',
    'profile.verifiedNeighbor': 'Verified Neighbor',
    'profile.topHelper': 'Top Helper',
    'profile.about': 'About',
    'profile.recentAchievements': 'Recent Achievements',
    'profile.viewAll': 'View All',
    'profile.overview': 'Overview',
    'profile.achievements': 'Achievements',
    'profile.appStatus': 'App Status',
    'profile.manageLocations': 'Manage Locations',
    'profile.settings': 'Settings',
    'profile.safety': 'Safety & Trust',
    'profile.impact': 'Your Impact',
    'profile.help': 'Help & Support',
    'profile.signOut': 'Sign Out',

    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.retry': 'Retry',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.share': 'Share',
    'common.report': 'Report',
    'common.block': 'Block',
    'common.Chennai': 'Chennai',
    'common.minutes': 'min',
    'common.hours': 'hours',
    'common.days': 'days',

    // Feed & Posts
    'app.name': 'Chennai Community',
    'app.title': 'Namma Ooru',
    'feed.filter.all': 'All Chennai',
    'feed.filter.local': 'My Area',
    'feed.back': 'Back to Feed',
    'feed.like_action': 'Like',
    'post.create.title': 'Create New Post',
    'post.create.placeholder': 'Share what\'s happening in your neighborhood... 🏘️',
    'post.create.submit': 'Post 🚀',
    'post.create.cancel': 'Cancel',
    'post.create.posting': 'Posting...',
    'comments.title': 'Comments',
    'comments.empty': 'No comments yet. Be the first!',
    'comments.placeholder': 'Write a comment...',
    'comments.add': 'Add',
    'ai.summary': 'AI Summary',
    'ai.summarize': 'Summarize',

    // Live Updates & Weather
    'live.title': 'Live Updates',
    'live.powered': 'Powered by Gemini ⚡',
    'live.loading': 'Fetching latest updates...',
    'live.empty': 'No updates available at the moment. Stay safe! 🙏',
    'weather.loading': 'Loading weather...',
    'weather.condition.clear': 'Clear Sky',
    'weather.condition.cloudy': 'Partly Cloudy',
    'weather.condition.fog': 'Foggy',
    'weather.condition.rain': 'Rainy',
    'weather.condition.snow': 'Snowy',
    'weather.condition.showers': 'Showers',
    'weather.condition.thunder': 'Thunderstorm',
    'weather.condition.unknown': 'Unknown',

    // Stories
    'story.auto': 'Auto Share',
    'story.food': 'Food Hunt',
    'story.commute': 'Commute',
    'story.info': 'Info',
    'story.gethu': 'Chennai Gethu',
  },

  ta: {
    // Welcome Screen
    'welcome.title': 'சென்னை சமூகத்திற்கு வரவேற்கிறோம்',
    'welcome.subtitle': 'உங்கள் அண்டை வீட்டுக்காரர்களுடன் இணையுங்கள், உள்ளூர் சேவைகளைக் கண்டறியுங்கள்',
    'welcome.tagline': 'உங்கள் நம்பகமான பக்கத்து வீட்டு நெட்வொர்க்',
    'welcome.continue': 'தொடர்க',

    // Pincode Verification
    'pincode.title': 'உங்கள் இடத்தை சரிபார்க்கவும்',
    'pincode.subtitle': 'உங்கள் உள்ளூர் சமூகத்துடன் இணைய பின்கோடை உள்ளிடவும்',
    'pincode.placeholder': 'சென்னை பின்கோடை உள்ளிடவும்',
    'pincode.verify': 'இடத்தை சரிபார்க்கவும்',
    'pincode.skip': 'இப்போதைக்கு தவிர்க்கவும்',
    'pincode.trust': 'நம்பிக்கை மற்றும் பாதுகாப்பு',
    'pincode.privacy': 'உங்கள் இட தரவு குறியாக்கம் செய்யப்பட்டு அருகிலுள்ள அண்டை வீட்டுக்காரர்களுடன் இணைக்க மட்டுமே பயன்படுத்தப்படுகிறது',

    // Bottom Navigation
    'nav.home': 'முகப்பு',
    'nav.services': 'சேவைகள்',
    'nav.chat': 'அரட்டை',
    'nav.profile': 'சுயவிவரம்',

    // Community Feed
    'feed.title': 'சமூக ஊட்டம்',
    'feed.subtitle': 'உங்கள் பகுதியில் என்ன நடக்கிறது என்பதைப் பாருங்கள்',
    'feed.whatsHappening': 'உங்கள் பகுதியில் என்ன நடக்கிறது?',
    'feed.share': 'பகிர்க',
    'feed.viewComments': 'கருத்துகளைப் பார்க்கவும்',
    'feed.like': 'விருப்பம்',

    // Local Services
    'services.title': 'உள்ளூர் சேவைகள்',
    'services.subtitle': 'உங்கள் சமூகத்தின் நம்பகமான சேவைகள்',
    'services.verified': 'சரிபார்க்கப்பட்டது',
    'services.viewAll': 'அனைத்தையும் பார்க்கவும்',
    'services.book': 'சேவையை பதிவு செய்க',
    'services.contact': 'தொடர்பு கொள்க',

    // Chat
    'chat.title': 'அரட்டை',
    'chat.subtitle': 'உங்கள் சமூகத்துடன் தொடர்பில் இருங்கள்',
    'chat.keyboard': 'தமிழ் விசைப்பலகை ஆதரவு',
    'chat.joinGroups': 'குழுக்களில் சேரவும்',
    'chat.startChat': 'அரட்டை தொடங்கவும்',
    'chat.announcements': 'அறிவிப்புகள்',
    'chat.placeholder': 'உங்கள் செய்தியை தட்டச்சு செய்யவும்...',
    'chat.active': 'இப்போது செயலில்',
    'chat.members': 'உறுப்பினர்கள்',
    'chat.official': 'அதிகாரிக',

    // Profile
    'profile.trustScore': 'நம்பிக்கை மதிப்பெண்',
    'profile.connections': 'இணைப்புகள்',
    'profile.postsShared': 'பகிரப்பட்ட இடுகைகள்',
    'profile.eventsJoined': 'நிகழ்வுகளில் சேர்ந்தது',
    'profile.verifiedNeighbor': 'சரிபார்க்கப்பட்ட அண்டை வீட்டுக்காரர்',
    'profile.topHelper': 'சிறந்த உதவியாளர்',
    'profile.about': 'பற்றி',
    'profile.recentAchievements': 'சமீபத்திய சாதனைகள்',
    'profile.viewAll': 'அனைத்தையும் பார்க்கவும்',
    'profile.overview': 'கண்ணோட்டம்',
    'profile.achievements': 'சாதனைகள்',
    'profile.appStatus': 'பயன்பாட்டு நிலை',
    'profile.manageLocations': 'இடங்களை நிர்வகிக்கவும்',
    'profile.settings': 'அமைப்புகள்',
    'profile.safety': 'பாதுகாப்பு மற்றும் நம்பிக்கை',
    'profile.impact': 'உங்கள் தாக்கம்',
    'profile.help': 'உதவி மற்றும் ஆதரவு',
    'profile.signOut': 'வெளியேறு',

    // Common
    'common.loading': 'ஏற்றுகிறது...',
    'common.error': 'பிழை',
    'common.retry': 'மீண்டும் முயற்சிக்கவும்',
    'common.cancel': 'ரத்து செய்க',
    'common.save': 'சேமிக்கவும்',
    'common.edit': 'திருத்தவும்',
    'common.delete': 'நீக்கவும்',
    'common.share': 'பகிர்க',
    'common.report': 'புகார் செய்க',
    'common.block': 'தடுக்கவும்',
    'common.Chennai': 'சென்னை',
    'common.minutes': 'நிமிடம்',
    'common.hours': 'மணி',
    'common.days': 'நாட்கள்',

    // Feed & Posts
    'app.name': 'சென்னை சமூகம்',
    'app.title': 'நம்ம ஊரு',
    'feed.filter.all': 'சென்னை முழுவதும்',
    'feed.filter.local': 'என் பகுதி',
    'feed.back': 'முகப்பிற்கு திரும்புக',
    'feed.like_action': 'விருப்பம்',
    'post.create.title': 'புதிய இடுகை',
    'post.create.placeholder': 'உங்கள் பகுதியில் என்ன நடக்கிறது என்பதைப் பகிரவும்... 🏘️',
    'post.create.submit': 'பதிவிடுக 🚀',
    'post.create.cancel': 'ரத்து',
    'post.create.posting': 'பதிவேற்றுகிறது...',
    'comments.title': 'கருத்துகள்',
    'comments.empty': 'கருத்துகள் இல்லை. நீங்களே முதலில் பதிவிடுங்கள்!',
    'comments.placeholder': 'கருத்து எழுதுங்கள்...',
    'comments.add': 'சேர்',
    'ai.summary': 'AI சுருக்கம்',
    'ai.summarize': 'சுருக்கவும்',

    // Live Updates & Weather
    'live.title': 'நேரலை அறிவிப்புகள்',
    'live.powered': 'ஜெமினி மூலம் இயங்குகிறது ⚡',
    'live.loading': 'சமீபத்திய அறிவிப்புகளைப் பெறுகிறது...',
    'live.empty': 'தற்போது அறிவிப்புகள் இல்லை. பாதுகாப்பாக இருங்கள்! 🙏',
    'weather.loading': 'வானிலை ஏற்றுகிறது...',
    'weather.condition.clear': 'தெளிவான வானம்',
    'weather.condition.cloudy': 'மேகமூட்டம்',
    'weather.condition.fog': 'பனிமூட்டம்',
    'weather.condition.rain': 'மழை',
    'weather.condition.snow': 'பனி',
    'weather.condition.showers': 'தூறல்',
    'weather.condition.thunder': 'இடியுடன் கூடிய மழை',
    'weather.condition.unknown': 'தெரியவில்லை',

    // Stories
    'story.auto': 'ஆட்டோ ஷேர்',
    'story.food': 'உணவு வேட்டை',
    'story.commute': 'பயணம்',
    'story.info': 'தகவல்',
    'story.gethu': 'சென்னை கெத்து',
  },

  'ta-rom': {
    // Welcome Screen
    'welcome.title': 'Chennai Community-ku Varaverpkirom',
    'welcome.subtitle': 'Ungal andai veettukkaargaludan inaiyungal, ullur sevaikaalai kandariyngal',
    'welcome.tagline': 'Ungal nambagamana pakkathu veettu network',
    'welcome.continue': 'Thodarka',

    // Pincode Verification
    'pincode.title': 'Ungal Idathai Saripaarkavum',
    'pincode.subtitle': 'Ungal ullur samugathudan inaiya pincodai ullidavum',
    'pincode.placeholder': 'Chennai pincodai ullidavum',
    'pincode.verify': 'Idathai Saripaarkavum',
    'pincode.skip': 'Ippothaikku Thavirkavum',
    'pincode.trust': 'Nambikkai matrum Pathukappu',
    'pincode.privacy': 'Ungal ida dharavu kuriyaakkam seiyappattu arugillulla andai veettukkaargaludan inaika mattume payanpaduthappadugiradhu',

    // Bottom Navigation
    'nav.home': 'Mugappu',
    'nav.services': 'Sevaigal',
    'nav.chat': 'Arattai',
    'nav.profile': 'Suyavivaram',

    // Community Feed
    'feed.title': 'Samuga Oottam',
    'feed.subtitle': 'Ungal paguthiyil enna nadakkirdhu enbadhait parunga',
    'feed.whatsHappening': 'Ungal paguthiyil enna nadakkirdhu?',
    'feed.share': 'Pagirka',
    'feed.viewComments': 'Karuthugalai paarkavum',
    'feed.like': 'Viruppam',

    // Local Services
    'services.title': 'Ullur Sevaigal',
    'services.subtitle': 'Ungal samugathin nambagamana sevaigal',
    'services.verified': 'Saripaarkappa',
    'services.viewAll': 'Anaithayaum paarkavum',
    'services.book': 'Sevayai padhivu seika',
    'services.contact': 'Thodarbu kolka',

    // Chat
    'chat.title': 'Arattai',
    'chat.subtitle': 'Ungal samugathudan thodarbil irunga',
    'chat.keyboard': 'Tamil visaippalagai adharavu',
    'chat.joinGroups': 'Kuzhukkalil seravum',
    'chat.startChat': 'Arattai thodangavum',
    'chat.announcements': 'Arivippugal',
    'chat.placeholder': 'Ungal seidhaiyai tatacchu seyyavum...',
    'chat.active': 'Ippodhu seyalil',
    'chat.members': 'Urupinargal',
    'chat.official': 'Adhigariga',

    // Profile
    'profile.trustScore': 'Nambikkai Mathipenn',
    'profile.connections': 'Inaippugal',
    'profile.postsShared': 'Pagirappattu Idugaigal',
    'profile.eventsJoined': 'Nigazhvugalil Serndhadhu',
    'profile.verifiedNeighbor': 'Saripaarkappa Andai Veettukkarar',
    'profile.topHelper': 'Sirandha Udhaviyalar',
    'profile.about': 'Patri',
    'profile.recentAchievements': 'Sameepaththiya Sadhanigal',
    'profile.viewAll': 'Anaithayaum paarkavum',
    'profile.overview': 'Kannottam',
    'profile.achievements': 'Sadhanigal',
    'profile.appStatus': 'Payanpattu Nilai',
    'profile.manageLocations': 'Idangalai Nirvagikavum',
    'profile.settings': 'Amaippugal',
    'profile.safety': 'Pathukappu matrum Nambikkai',
    'profile.impact': 'Ungal Thaakkam',
    'profile.help': 'Udhavi matrum Adharavu',
    'profile.signOut': 'Veliyeru',

    // Common
    'common.loading': 'Etrugiradhu...',
    'common.error': 'Pilai',
    'common.retry': 'Meendum Muyarchikavum',
    'common.cancel': 'Rathu seika',
    'common.save': 'Semikavum',
    'common.edit': 'Thiruthavum',
    'common.delete': 'Neekavum',
    'common.share': 'Pagirka',
    'common.report': 'Pugaar seika',
    'common.block': 'Thadukavum',
    'common.Chennai': 'Chennai',
    'common.minutes': 'nimdam',
    'common.hours': 'mani',
    'common.days': 'naatkal',

    // Feed & Posts
    'app.name': 'Chennai Community',
    'app.title': 'Namma Ooru',
    'feed.filter.all': 'All Chennai',
    'feed.filter.local': 'En Area',
    'feed.back': 'Feed-ku Thirumba',
    'feed.like_action': 'Podu Macha',
    'post.create.title': 'New Post Podu',
    'post.create.placeholder': 'Unga area-la enna nadakkudhu nu sollunga... 🏘️',
    'post.create.submit': 'Post Pannu 🚀',
    'post.create.cancel': 'Venaam',
    'post.create.posting': 'Posting...',
    'comments.title': 'Comments',
    'comments.empty': 'Comments innum varala. Neenga first podunga!',
    'comments.placeholder': 'Comment podunga...',
    'comments.add': 'Ser',
    'ai.summary': 'AI Summary',
    'ai.summarize': 'Summarize',

    // Live Updates & Weather
    'live.title': 'Live Updates',
    'live.powered': 'Powered by Gemini ⚡',
    'live.loading': 'Updates edukkudhu...',
    'live.empty': 'Ippo updates illa. Pathirama irunga! 🙏',
    'weather.loading': 'Weather paakkudhu...',
    'weather.condition.clear': 'Clear Sky',
    'weather.condition.cloudy': 'Megamootam',
    'weather.condition.fog': 'Panimootam',
    'weather.condition.rain': 'Mazhai',
    'weather.condition.snow': 'Pani',
    'weather.condition.showers': 'Thooral',
    'weather.condition.thunder': 'Idi Mazhai',
    'weather.condition.unknown': 'Theriyala',

    // Stories
    'story.auto': 'Auto Share',
    'story.food': 'Food Hunt',
    'story.commute': 'Commute',
    'story.info': 'Info',
    'story.gethu': 'Chennai Gethu',
  }
};

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string, fallback?: string): string => {
    const translation = translations[language][key as keyof typeof translations[typeof language]];
    return translation || fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}