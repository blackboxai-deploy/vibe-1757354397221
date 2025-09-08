'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Location } from '@/lib/types';

interface LocationSuggestion {
  id: string;
  address: string;
  location: Location;
}

interface LocationInputProps {
  placeholder?: string;
  value?: string;
  onLocationSelect: (location: Location, address: string) => void;
  className?: string;
  disabled?: boolean;
}

export function LocationInput({
  placeholder = "Enter address",
  value = "",
  onLocationSelect,
  className = "",
  disabled = false,
}: LocationInputProps) {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Mock address suggestions - In a real app, this would use Google Places API or similar
  const MOCK_LOCATIONS: LocationSuggestion[] = [
    {
      id: '1',
      address: '123 Main Street, New York, NY 10001',
      location: {
        latitude: 40.7589,
        longitude: -73.9851,
        address: '123 Main Street',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
      },
    },
    {
      id: '2',
      address: '456 Broadway, New York, NY 10013',
      location: {
        latitude: 40.7193,
        longitude: -74.0093,
        address: '456 Broadway',
        city: 'New York',
        state: 'NY',
        zipCode: '10013',
      },
    },
    {
      id: '3',
      address: '789 5th Avenue, New York, NY 10022',
      location: {
        latitude: 40.7614,
        longitude: -73.9776,
        address: '789 5th Avenue',
        city: 'New York',
        state: 'NY',
        zipCode: '10022',
      },
    },
    {
      id: '4',
      address: 'Central Park, New York, NY 10024',
      location: {
        latitude: 40.7829,
        longitude: -73.9654,
        address: 'Central Park',
        city: 'New York',
        state: 'NY',
        zipCode: '10024',
      },
    },
    {
      id: '5',
      address: 'Times Square, New York, NY 10036',
      location: {
        latitude: 40.7580,
        longitude: -73.9855,
        address: 'Times Square',
        city: 'New York',
        state: 'NY',
        zipCode: '10036',
      },
    },
    {
      id: '6',
      address: 'Brooklyn Bridge, Brooklyn, NY 11201',
      location: {
        latitude: 40.7061,
        longitude: -73.9969,
        address: 'Brooklyn Bridge',
        city: 'Brooklyn',
        state: 'NY',
        zipCode: '11201',
      },
    },
  ];

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const searchLocations = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // Filter mock locations based on input
    const filtered = MOCK_LOCATIONS.filter(location =>
      location.address.toLowerCase().includes(query.toLowerCase())
    );

    setSuggestions(filtered);
    setIsLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setInputValue(query);
    setShowSuggestions(true);
    searchLocations(query);
  };

  const handleSuggestionClick = (suggestion: LocationSuggestion) => {
    setInputValue(suggestion.address);
    setShowSuggestions(false);
    onLocationSelect(suggestion.location, suggestion.address);
  };

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const currentLocation: Location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            address: 'Current Location',
            city: 'Current',
            state: '',
            zipCode: '',
          };
          
          setInputValue('Current Location');
          setShowSuggestions(false);
          onLocationSelect(currentLocation, 'Current Location');
          setIsLoading(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          setIsLoading(false);
        }
      );
    }
  };

  return (
    <div className="relative">
      <div className="flex space-x-2">
        <div className="flex-1 relative">
          <Input
            type="text"
            placeholder={placeholder}
            value={inputValue}
            onChange={handleInputChange}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => {
              // Delay hiding suggestions to allow clicks
              setTimeout(() => setShowSuggestions(false), 150);
            }}
            className={className}
            disabled={disabled}
          />
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
            </div>
          )}
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleCurrentLocation}
          disabled={disabled || isLoading}
          className="flex items-center space-x-1 text-sm"
        >
          <span>📍</span>
          <span className="hidden sm:inline">Current</span>
        </Button>
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.id}
              type="button"
              className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  <span className="text-gray-400">📍</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {suggestion.location.address}
                  </p>
                  <p className="text-xs text-gray-500">
                    {suggestion.location.city}, {suggestion.location.state} {suggestion.location.zipCode}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results message */}
      {showSuggestions && inputValue.length >= 3 && suggestions.length === 0 && !isLoading && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
          <div className="px-4 py-3 text-sm text-gray-500 text-center">
            No locations found. Try a different search term.
          </div>
        </div>
      )}
    </div>
  );
}