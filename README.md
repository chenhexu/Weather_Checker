# Weather Checker

A simple React TypeScript app that displays current weather and 5-day forecast for any city worldwide using the OpenWeatherMap API.

## Features

- 🌍 Search for weather in any city worldwide
- 🌡️ Current weather conditions with temperature, humidity, and wind speed
- 📅 5-day weather forecast
- 🎨 Beautiful weather icons
- 📱 Responsive design that works on all devices

## Setup Instructions

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Get an API key from [OpenWeatherMap](https://openweathermap.org/):
   - Sign up for a free account
   - Go to "My API keys" section
   - Copy your API key

4. Create a `.env` file in the root directory and add your API key:
   ```
   REACT_APP_WEATHER_API_KEY=your_api_key_here
   ```

5. Start the development server:
   ```bash
   npm start
   ```

6. Open [http://localhost:3000](http://localhost:3000) to view the app

## Technologies Used

- React with TypeScript
- Material-UI for styling
- Axios for API calls
- OpenWeatherMap API

## API Information

This app uses the OpenWeatherMap API which provides:
- Current weather data
- 5-day weather forecast
- Weather icons
- Global city search

The free tier allows up to 1,000 API calls per day.