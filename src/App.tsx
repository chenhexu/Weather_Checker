import React, { useState, useEffect } from 'react';
import { Container, Paper, Typography, Box, CircularProgress, Button, TextField, Autocomplete } from '@mui/material';
import axios from 'axios';
import { config } from './config';

interface City {
  name: string;
  country: string;
  lat: number;
  lon: number;
  state?: string;
}

interface WeatherData {
  current: {
    main: {
      temp: number;
      feels_like: number;
      humidity: number;
      temp_min: number;
      temp_max: number;
    };
    weather: Array<{
      main: string;
      description: string;
      icon: string;
    }>;
    wind: {
      speed: number;
    };
  };
  forecast: {
    list: Array<{
      dt: number;
      main: {
        temp: number;
        temp_min: number;
        temp_max: number;
        humidity: number;
      };
      weather: Array<{
        main: string;
        description: string;
        icon: string;
      }>;
      wind: {
        speed: number;
      };
      dt_txt: string;
    }>;
    city: {
      name: string;
      country: string;
    };
  };
}

function App() {
  const [searchInput, setSearchInput] = useState('');
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const searchCities = async (query: string) => {
    if (!query || query.length < 3) {
      setCities([]);
      return;
    }

    try {
      const response = await axios.get('http://api.openweathermap.org/geo/1.0/direct', {
        params: {
          q: query,
          limit: 5,
          appid: config.openWeatherMap.apiKey
        }
      });
      setCities(response.data);
    } catch (err) {
      console.error('Error searching cities:', err);
      setCities([]);
    }
  };

  const fetchWeather = async (city: City) => {
    setLoading(true);
    setError('');
    
    try {
      // Get current weather
      const currentResponse = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
        params: {
          lat: city.lat,
          lon: city.lon,
          units: 'metric',
          appid: config.openWeatherMap.apiKey
        }
      });

      // Get forecast
      const forecastResponse = await axios.get('https://api.openweathermap.org/data/2.5/forecast', {
        params: {
          lat: city.lat,
          lon: city.lon,
          units: 'metric',
          appid: config.openWeatherMap.apiKey
        }
      });

      setWeather({
        current: currentResponse.data,
        forecast: forecastResponse.data
      });
    } catch (err: any) {
      console.error('API Error:', err.response?.data || err.message);
      setError('Failed to fetch weather data. Please try again.');
      setWeather(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    const montrealCity: City = {
      name: 'Montreal',
      country: 'CA',
      lat: 45.5031824,
      lon: -73.5698065,
      state: 'Quebec'
    };
    setSelectedCity(montrealCity);
    fetchWeather(montrealCity);
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric'
    });
  };

  const getWeatherIcon = (iconCode: string) => {
    return `https://openweathermap.org/img/wn/${iconCode}@4x.png`;
  };

  const getDailyForecasts = () => {
    if (!weather?.forecast.list) return [];
    
    const dailyForecasts: { [key: string]: any } = {};
    
    weather.forecast.list.forEach(forecast => {
      const date = forecast.dt_txt.split(' ')[0];
      if (!dailyForecasts[date]) {
        dailyForecasts[date] = {
          date,
          temp_min: forecast.main.temp_min,
          temp_max: forecast.main.temp_max,
          weather: forecast.weather[0],
          humidity: forecast.main.humidity,
          wind: forecast.wind
        };
      } else {
        dailyForecasts[date].temp_min = Math.min(dailyForecasts[date].temp_min, forecast.main.temp_min);
        dailyForecasts[date].temp_max = Math.max(dailyForecasts[date].temp_max, forecast.main.temp_max);
      }
    });

    return Object.values(dailyForecasts);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Weather Checker
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Autocomplete
            fullWidth
            options={cities}
            getOptionLabel={(city) => `${city.name}, ${city.state || ''} ${city.country}`}
            value={selectedCity}
            onChange={(_, newValue) => {
              setSelectedCity(newValue);
              if (newValue) {
                fetchWeather(newValue);
              }
            }}
            onInputChange={(_, newInputValue) => {
              setSearchInput(newInputValue);
              searchCities(newInputValue);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search city"
                placeholder="e.g., Montreal, London, Tokyo"
                fullWidth
              />
            )}
            sx={{ mb: 2 }}
          />

          <Button
            variant="contained"
            onClick={() => selectedCity && fetchWeather(selectedCity)}
            disabled={loading || !selectedCity}
            fullWidth
          >
            Refresh
          </Button>
        </Box>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Typography color="error" align="center">
            {error}
          </Typography>
        )}

        {weather && selectedCity && (
          <Box>
            {/* Current Weather */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography variant="h5" gutterBottom>
                {selectedCity.name}, {selectedCity.country}
              </Typography>
              {weather.current.weather[0] && (
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  flexDirection: 'column',
                  my: 2 
                }}>
                  <img
                    src={getWeatherIcon(weather.current.weather[0].icon)}
                    alt={weather.current.weather[0].description}
                    style={{ 
                      width: 120, 
                      height: 120,
                      filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.1))'
                    }}
                  />
                  <Typography variant="h6" sx={{ mt: 1, textTransform: 'capitalize' }}>
                    {weather.current.weather[0].description}
                  </Typography>
                </Box>
              )}
              <Typography variant="h3" sx={{ my: 1, fontWeight: 'bold' }}>
                {Math.round(weather.current.main.temp)}°C
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6">
                  Feels like: {Math.round(weather.current.main.feels_like)}°C
                </Typography>
                <Typography>
                  Humidity: {weather.current.main.humidity}%
                </Typography>
                <Typography>
                  Wind: {Math.round(weather.current.wind.speed)} m/s
                </Typography>
              </Box>
            </Box>

            {/* 5-Day Forecast */}
            <Typography variant="h6" gutterBottom sx={{ textAlign: 'center', mt: 4, mb: 3 }}>
              5-Day Forecast
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
              {getDailyForecasts().map((day, index) => (
                <Box key={day.date} sx={{ flexBasis: { xs: '100%', sm: 'calc(50% - 16px)', md: 'calc(33.33% - 16px)' } }}>
                  <Paper 
                    elevation={2} 
                    sx={{ 
                      p: 2, 
                      textAlign: 'center',
                      transition: 'transform 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                      }
                    }}
                  >
                    <Typography variant="h6" gutterBottom>
                      {index === 0 ? 'Today' : formatDate(day.date)}
                    </Typography>
                    <img
                      src={getWeatherIcon(day.weather.icon)}
                      alt={day.weather.description}
                      style={{ 
                        width: 80, 
                        height: 80,
                        filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.1))'
                      }}
                    />
                    <Typography sx={{ mt: 1, textTransform: 'capitalize' }}>
                      {day.weather.description}
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="h6">
                        High: {Math.round(day.temp_max)}°C
                      </Typography>
                      <Typography variant="h6">
                        Low: {Math.round(day.temp_min)}°C
                      </Typography>
                      <Typography>
                        Humidity: {day.humidity}%
                      </Typography>
                      <Typography>
                        Wind: {Math.round(day.wind.speed)} m/s
                      </Typography>
                    </Box>
                  </Paper>
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Paper>
    </Container>
  );
}

export default App;