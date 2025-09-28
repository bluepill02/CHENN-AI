import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAutoShare } from "../services/AutoShareService";
import type { ChennaiLocation, Ride } from "../utils/autoShareInterfaces";
import { Card } from "./ui/card";

const tabs = [
  { key: 'upcoming', label: 'Upcoming', tamil: 'வரவிருக்கும்' },
  { key: 'completed', label: 'Completed', tamil: 'முடிந்தது' },
  { key: 'cancelled', label: 'Cancelled', tamil: 'ரத்து' },
] as const;

type TabKey = typeof tabs[number]['key'];

const AutoShareHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { rides, isUsingBackend, error, refresh, loading } = useAutoShare();
  const [activeTab, setActiveTab] = useState<TabKey>('completed');

  const filteredRides = useMemo<Ride[]>(() => {
    switch (activeTab) {
      case 'upcoming':
        return rides.filter(ride => ride.status === 'upcoming');
      case 'cancelled':
        return rides.filter(ride => ['cancelled', 'no-show'].includes(ride.status));
      case 'completed':
      default:
        return rides.filter(ride => ride.status === 'completed');
    }
  }, [rides, activeTab]);

  const getLocationDisplay = (location: string | ChennaiLocation, language: 'english' | 'tamil' = 'english') => {
    if (typeof location === 'string') {
      const parts = location.split(' / ');
      return language === 'english' ? parts[0] : (parts[1] || parts[0]);
    }
    return language === 'english' ? location.english : location.tamil;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-amber-800">Ride History / பயண வரலாறு</h1>
            <p className="text-sm text-amber-600">
              Review your completed and cancelled Chennai auto share rides
            </p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-lg bg-white border border-amber-200 text-amber-700 hover:bg-amber-50"
          >
            Back
          </button>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 bg-white/70 border border-amber-100 rounded-xl p-4 shadow-sm">
          <div>
            <p className="text-sm font-semibold text-amber-700">
              {isUsingBackend ? 'Live Chennai Auto Share history' : 'Simulation history view'}
            </p>
            <p className="text-xs text-amber-600">
              {error
                ? error
                : isUsingBackend
                  ? 'Historical rides are fetched from the live backend.'
                  : 'Showing locally stored history. Data syncs once backend becomes available.'}
            </p>
          </div>
          <button
            type="button"
            onClick={refresh}
            disabled={loading}
            className="self-start md:self-auto px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg shadow hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-60"
          >
            {loading ? 'Refreshing…' : 'Refresh history'}
          </button>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg border transition-colors duration-200 font-medium flex items-center gap-2 ${
                activeTab === tab.key
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-transparent shadow'
                  : 'bg-white border-amber-200 text-amber-700 hover:bg-amber-50'
              }`}
            >
              <span>{tab.label}</span>
              <span className="text-xs opacity-80">{tab.tamil}</span>
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {loading && filteredRides.length === 0 ? (
            <Card className="p-6 animate-pulse">
              <div className="h-4 bg-amber-100 rounded w-1/3 mb-3" />
              <div className="h-3 bg-amber-50 rounded w-1/4 mb-2" />
              <div className="h-3 bg-amber-50 rounded w-1/2" />
            </Card>
          ) : filteredRides.length === 0 ? (
            <Card className="p-6 text-center">
              <div className="text-4xl mb-3">📭</div>
              <div className="text-lg font-semibold text-amber-800">No rides found</div>
              <div className="text-sm text-amber-600">Try switching tabs or create a new ride.</div>
            </Card>
          ) : (
            filteredRides.map(ride => (
              <Card key={ride.id} className="p-5 shadow-md border border-amber-100">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-lg font-semibold text-amber-800">
                      {getLocationDisplay(ride.pickup, 'english')} → {getLocationDisplay(ride.drop, 'english')}
                    </div>
                    <div className="text-sm text-amber-600">
                      {getLocationDisplay(ride.pickup, 'tamil')} → {getLocationDisplay(ride.drop, 'tamil')}
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      {new Date(ride.time).toLocaleString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-emerald-700">₹{ride.fare}</div>
                    <div className="text-xs text-gray-500">
                      {ride.seatsTotal - ride.seatsAvailable}/{ride.seatsTotal} seats used
                    </div>
                    <div className={`mt-2 inline-block px-3 py-1 text-xs rounded-full capitalize ${
                      ride.status === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : ride.status === 'cancelled'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-amber-100 text-amber-700'
                    }`}>
                      {ride.status}
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AutoShareHistoryPage;
