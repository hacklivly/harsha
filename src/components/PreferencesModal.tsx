import React, { useState } from 'react';
import { useCallStore } from '../store/useCallStore';

const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  // Add more countries as needed
];

const INTERESTS = [
  'Music', 'Gaming', 'Movies', 'Sports', 'Technology',
  'Art', 'Travel', 'Food', 'Fashion', 'Books'
];

export const PreferencesModal: React.FC = () => {
  const { preferences, setPreferences } = useCallStore();
  const [selectedInterests, setSelectedInterests] = useState<string[]>(preferences.interests);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPreferences({ interests: selectedInterests });
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-xl max-w-md w-full">
      <h2 className="text-2xl font-bold mb-4">Your Preferences</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Country (Optional)
          </label>
          <select
            className="w-full p-2 border rounded-lg"
            value={preferences.country}
            onChange={(e) => setPreferences({ country: e.target.value })}
          >
            <option value="">Any Country</option>
            {COUNTRIES.map(country => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Interests (Select multiple)
          </label>
          <div className="grid grid-cols-2 gap-2">
            {INTERESTS.map(interest => (
              <button
                key={interest}
                type="button"
                onClick={() => toggleInterest(interest)}
                className={`p-2 rounded-lg text-sm ${
                  selectedInterests.includes(interest)
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {interest}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
        >
          Save Preferences
        </button>
      </form>
    </div>
  );
};