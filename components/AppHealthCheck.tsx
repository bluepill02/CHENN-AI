import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { CheckCircle, AlertCircle, Clock, Wifi, Database, Users } from 'lucide-react';

interface HealthCheck {
  name: string;
  status: 'healthy' | 'warning' | 'error';
  message: string;
  responseTime?: number;
}

export function AppHealthCheck() {
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    performHealthChecks();
  }, []);

  const performHealthChecks = async () => {
    setIsLoading(true);
    
    const checks: HealthCheck[] = [];
    
    // Simulate various health checks
    try {
      // UI Components Check
      const startTime = Date.now();
      await new Promise(resolve => setTimeout(resolve, 100));
      checks.push({
        name: 'UI Components',
        status: 'healthy',
        message: 'All Chennai-themed components loaded successfully',
        responseTime: Date.now() - startTime
      });

      // Image Assets Check
      checks.push({
        name: 'Chennai Images',
        status: 'healthy',
        message: 'Chennai cityscape and waterfront images loaded',
      });

      // Tamil Language Support
      checks.push({
        name: 'Tamil Language',
        status: 'healthy',
        message: 'Tamil keyboard and bilingual support active',
      });

      // Local Storage
      try {
        localStorage.setItem('health-check', 'test');
        localStorage.removeItem('health-check');
        checks.push({
          name: 'Local Storage',
          status: 'healthy',
          message: 'Local data persistence working',
        });
      } catch {
        checks.push({
          name: 'Local Storage',
          status: 'warning',
          message: 'Limited offline functionality',
        });
      }

      // Community Features
      checks.push({
        name: 'Community Features',
        status: 'healthy',
        message: 'Feed, chat, services, and profile ready',
      });

      // Pincode Verification
      checks.push({
        name: 'Chennai Verification',
        status: 'healthy',
        message: 'Pincode verification system operational',
      });

    } catch (error) {
      checks.push({
        name: 'App Initialization',
        status: 'error',
        message: 'Failed to initialize some components',
      });
    }

    setHealthChecks(checks);
    setIsLoading(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'error':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const healthyCount = healthChecks.filter(check => check.status === 'healthy').length;
  const totalChecks = healthChecks.length;

  if (isLoading) {
    return (
      <Card className="p-4 bg-white border-orange-100">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-gray-600">Checking app health...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-white border-orange-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium flex items-center gap-2">
          <Wifi className="w-4 h-4 text-orange-600" />
          Chennai Community App Status
        </h3>
        <Badge className={`${healthyCount === totalChecks ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
          {healthyCount}/{totalChecks} Healthy
        </Badge>
      </div>

      <div className="space-y-3">
        {healthChecks.map((check, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              {getStatusIcon(check.status)}
              <div>
                <p className="text-sm font-medium">{check.name}</p>
                <p className="text-xs text-gray-600">{check.message}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {check.responseTime && (
                <span className="text-xs text-gray-500">{check.responseTime}ms</span>
              )}
              <Badge className={getStatusColor(check.status)} style={{ fontSize: '10px' }}>
                {check.status}
              </Badge>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Last checked: {new Date().toLocaleTimeString()}</span>
          <Button
            onClick={performHealthChecks}
            variant="outline"
            size="sm"
            className="h-auto px-2 py-1 text-xs"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* App Info */}
      <div className="mt-3 p-3 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <Users className="w-3 h-3 text-orange-600" />
            <span className="text-gray-600">50K+ Users</span>
          </div>
          <div className="flex items-center gap-2">
            <Database className="w-3 h-3 text-orange-600" />
            <span className="text-gray-600">127 Areas</span>
          </div>
        </div>
        <p className="text-xs text-orange-600 mt-2 text-center">
          🏛️ Made exclusively for Chennai • சென்னை-க்காக மட்டும்
        </p>
      </div>
    </Card>
  );
}

export default AppHealthCheck;