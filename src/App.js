import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaWind, FaSearch } from 'react-icons/fa';
import { BsSunrise, BsSunset, BsDroplet, BsToggle2Off, BsToggle2On } from 'react-icons/bs';
import { IoLocation } from 'react-icons/io5';

function App() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState('London');
  const [searchInput, setSearchInput] = useState('');
  const [error, setError] = useState(null);
  const [isCelsius, setIsCelsius] = useState(true);
  const [suggestions, setSuggestions] = useState([]);

  const API_KEY = process.env.REACT_APP_WEATHER_API_KEY;
  const BASE_URL = process.env.REACT_APP_WEATHER_BASE_URL;

  const fetchSuggestions = async (query) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await axios.get(
        `${BASE_URL}/search.json?key=${API_KEY}&q=${query}`
      );
      setSuggestions(response.data);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    }
  };

  const fetchWeatherData = async (city) => {
    try {
      const weatherUrl = `${BASE_URL}/forecast.json?key=${API_KEY}&q=${city}&days=3&aqi=no`;
      const response = await axios.get(weatherUrl);
      setWeather(response.data);
      setLoading(false);
      setError(null);
    } catch (error) {
      console.error('Error fetching weather data:', error.response || error);
      setError(error.response?.data?.error?.message || 'Failed to fetch weather data. Please try again.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeatherData(location);
  }, [location]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setLoading(true);
      setLocation(searchInput);
      setSearchInput('');
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setLocation(suggestion.name);
    setSearchInput('');
    setSuggestions([]);
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [time, period] = timeStr.split(' ');
    return `${time} ${period}`;
  };

  const convertTemp = (temp) => {
    if (isCelsius) {
      return `${Math.round(temp)}°C`;
    }
    return `${Math.round((temp * 9/5) + 32)}°F`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-secondary">
        <div className="text-white text-center">
          <div className="mb-4">Loading weather data...</div>
          {error && <div className="text-red-400">{error}</div>}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-secondary">
        <div className="text-white text-center">
          <div className="text-red-400 mb-4">{error}</div>
          <button 
            onClick={() => {
              setError(null);
              setLocation('London');
            }}
            className="px-4 py-2 bg-accent rounded-full hover:bg-opacity-80"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary">
      <div className="container mx-auto px-4 py-8">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-8 relative">
          <div className="flex items-center justify-center gap-4">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  fetchSuggestions(e.target.value);
                }}
                placeholder="Search for a city..."
                className="w-full px-4 py-2 rounded-full bg-primary text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <FaSearch className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
              
              {/* Search Suggestions */}
              {suggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-2 bg-primary rounded-lg shadow-lg">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="px-4 py-2 hover:bg-accent cursor-pointer text-white"
                    >
                      {suggestion.name}, {suggestion.country}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </form>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Weather Card */}
          <div className="weather-gradient rounded-3xl p-8 text-center">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center">
                <IoLocation className="text-2xl mr-2" />
                <h2 className="text-xl font-semibold">{weather?.location?.name}</h2>
              </div>
              <button
                onClick={() => setIsCelsius(!isCelsius)}
                className="flex items-center text-sm"
              >
                {isCelsius ? <BsToggle2Off className="text-2xl" /> : <BsToggle2On className="text-2xl" />}
                <span className="ml-2">{isCelsius ? '°C' : '°F'}</span>
              </button>
            </div>
            <div className="weather-icon mb-6">
              <img 
                src={weather?.current?.condition?.icon}
                alt={weather?.current?.condition?.text}
                className="w-32 h-32 mx-auto"
              />
            </div>
            <div className="temperature mb-6">
              <h1 className="text-6xl font-bold">
                {convertTemp(weather?.current?.temp_c)}
              </h1>
              <p className="text-lg mt-2 capitalize">{weather?.current?.condition?.text}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-center">
                <BsDroplet className="text-2xl mr-2" />
                <span>{weather?.current?.humidity}%</span>
              </div>
              <div className="flex items-center justify-center">
                <FaWind className="text-2xl mr-2" />
                <span>{Math.round(weather?.current?.wind_kph)} km/h</span>
              </div>
              <div className="flex items-center justify-center">
                <BsSunrise className="text-2xl mr-2" />
                <span>{formatTime(weather?.forecast?.forecastday[0]?.astro?.sunrise)}</span>
              </div>
              <div className="flex items-center justify-center">
                <BsSunset className="text-2xl mr-2" />
                <span>{formatTime(weather?.forecast?.forecastday[0]?.astro?.sunset)}</span>
              </div>
            </div>
          </div>

          {/* Forecast Cards */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {weather?.forecast?.forecastday[0]?.hour
                ?.filter((hour) => new Date(hour.time) > new Date())
                ?.slice(0, 6)
                ?.map((hour, index) => (
                <div key={index} className="glass-effect p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    {new Date(hour.time).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </h3>
                  <img 
                    src={hour.condition.icon}
                    alt={hour.condition.text}
                    className="w-16 h-16 mx-auto mb-4"
                  />
                  <div className="flex justify-between text-sm">
                    <span>{convertTemp(hour.temp_c)}</span>
                    <span className="text-gray-400">{hour.condition.text}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
