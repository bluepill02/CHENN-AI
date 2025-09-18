import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { Separator } from "./ui/separator";
import { 
  ArrowLeft,
  User,
  MapPin,
  Shield,
  Bell,
  Settings,
  HelpCircle,
  LogOut,
  Edit,
  Star,
  Users,
  MessageCircle,
  Award,
  Globe,
  Lock,
  Smartphone,
  Moon,
  Volume2,
  ChevronRight
} from "lucide-react";

interface ProfileScreenProps {
  onBack: () => void;
}

export function ProfileScreen({ onBack }: ProfileScreenProps) {
  const userStats = [
    { label: "Posts", value: 12, icon: MessageCircle },
    { label: "Helpful", value: 47, icon: Star },
    { label: "Connections", value: 89, icon: Users },
  ];

  const achievements = [
    { name: "Helpful Neighbor", icon: "🤝", description: "Helped 25+ community members" },
    { name: "Local Expert", icon: "🏆", description: "Top contributor in T. Nagar" },
    { name: "Community Builder", icon: "🌟", description: "Started 3 community initiatives" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 pt-12 pb-6">
        <div className="flex items-center space-x-4 mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack}
            className="p-2 text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl">Profile</h1>
        </div>

        {/* User Info */}
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-2xl">A</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h2 className="text-xl">Arjun Natarajan</h2>
              <Shield className="w-5 h-5 text-green-300" />
            </div>
            <div className="flex items-center space-x-1 opacity-90 mb-2">
              <MapPin className="w-4 h-4" />
              <span>T. Nagar, Chennai</span>
            </div>
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              Trusted Member since 2023
            </Badge>
          </div>
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
            <Edit className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="px-6 -mt-3">
        {/* User Stats */}
        <Card className="bg-white border-gray-200 shadow-lg mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-4">
              {userStats.map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div key={idx} className="text-center">
                    <Icon className="w-5 h-5 text-orange-600 mx-auto mb-2" />
                    <p className="text-2xl text-gray-800 mb-1">{stat.value}</p>
                    <p className="text-gray-600">{stat.label}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card className="bg-white border-gray-200 mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-amber-600" />
              <span>Achievements</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {achievements.map((achievement, idx) => (
              <div key={idx} className="flex items-center space-x-3 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg">
                <span className="text-2xl">{achievement.icon}</span>
                <div>
                  <h3 className="text-gray-800 mb-1">{achievement.name}</h3>
                  <p className="text-gray-600">{achievement.description}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Settings Sections */}
        <div className="space-y-4">
          {/* Privacy & Safety */}
          <Card className="bg-white border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-green-600" />
                <span>Privacy & Safety</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Globe className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-gray-800">Profile Visibility</p>
                    <p className="text-gray-600">Show your profile to neighbors</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Lock className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-gray-800">Location Sharing</p>
                    <p className="text-gray-600">Share your area with community</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="bg-white border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-blue-600" />
                <span>Notifications</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <MessageCircle className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-gray-800">New Posts</p>
                    <p className="text-gray-600">Get notified of community updates</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Smartphone className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-gray-800">Push Notifications</p>
                    <p className="text-gray-600">Receive alerts on your phone</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Volume2 className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-gray-800">Emergency Alerts</p>
                    <p className="text-gray-600">Important safety notifications</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* App Settings */}
          <Card className="bg-white border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5 text-purple-600" />
                <span>App Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Moon className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-800">Dark Mode</span>
                </div>
                <Switch />
              </div>
              <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                <div className="flex items-center space-x-3">
                  <Globe className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-800">Language</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600">English</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </Button>
            </CardContent>
          </Card>

          {/* Support */}
          <Card className="bg-white border-gray-200">
            <CardContent className="p-4 space-y-4">
              <Button variant="ghost" className="w-full justify-start">
                <HelpCircle className="w-5 h-5 mr-3 text-gray-500" />
                <span className="text-gray-800">Help & Support</span>
              </Button>
              <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50">
                <LogOut className="w-5 h-5 mr-3" />
                <span>Sign Out</span>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Bottom spacing */}
        <div className="h-20"></div>
      </div>
    </div>
  );
}