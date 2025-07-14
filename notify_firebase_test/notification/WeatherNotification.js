import NotificationService from './NotificationService';

export const setupWeatherNotifications = (weatherData) => {
  // Check permissions and setup notifications
  NotificationService.requestPermissions().then(() => {
    // Schedule daily forecast notification for next day at 8 AM
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(8, 0, 0, 0);
    
    // Get daily forecast for tomorrow
    const tomorrowIndex = 1; // Today is 0, tomorrow is 1
    if (
      weatherData?.daily &&
      weatherData.daily.time &&
      weatherData.daily.time.length > tomorrowIndex
    ) {
      const conditions = getWeatherDescription(
        weatherData.daily.weathercode[tomorrowIndex],
      );
      const maxTemp = Math.round(
        weatherData.daily.temperature_2m_max[tomorrowIndex],
      );
      const minTemp = Math.round(
        weatherData.daily.temperature_2m_min[tomorrowIndex],
      );
      
      NotificationService.scheduledNotification(
        "Tomorrow's Weather Forecast",
        `${conditions} with temperatures between ${minTemp}°C and ${maxTemp}°C.`,
        tomorrow,
        'daily-forecast',
        'day',
      );
    }
    
    // Setup extreme weather alerts
    setupWeatherAlerts(weatherData);
  });
};

export const setupWeatherAlerts = (weatherData) => {
  // High temperature alert
  if (
    weatherData?.daily?.temperature_2m_max &&
    weatherData.daily.temperature_2m_max.length > 0
  ) {
    const maxTemp = Math.max(...weatherData.daily.temperature_2m_max);
    if (maxTemp > 35) {
      NotificationService.localNotification(
        'High Temperature Alert',
        `High temperatures reaching ${Math.round(maxTemp)}°C. Stay hydrated!`,
        'weather-alerts',
      );
    }
  }

  // Heavy rainfall alert
  if (
    weatherData?.daily?.precipitation_sum &&
    weatherData.daily.precipitation_sum.length > 0
  ) {
    const maxRain = Math.max(...weatherData.daily.precipitation_sum);
    if (maxRain > 20) {
      NotificationService.localNotification(
        'Heavy Rain Alert',
        `Heavy rainfall expected with up to ${Math.round(
          maxRain,
        )}mm. Take precautions!`,
        'weather-alerts',
      );
    }
  }

  // High wind alert
  if (
    weatherData?.hourly?.windspeed_10m &&
    weatherData.hourly.windspeed_10m.length > 0
  ) {
    const maxWind = Math.max(...weatherData.hourly.windspeed_10m);
    if (maxWind > 50) {
      NotificationService.localNotification(
        'High Wind Alert',
        `Strong winds expected with speeds up to ${Math.round(maxWind)}km/h.`,
        'weather-alerts',
      );
    }
  }
};

// Weather code descriptions
const getWeatherDescription = (code) => {
  const descriptions = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Foggy with frost',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    56: 'Light freezing drizzle',
    57: 'Dense freezing drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    66: 'Light freezing rain',
    67: 'Heavy freezing rain',
    71: 'Light snow',
    73: 'Moderate snow',
    75: 'Heavy snow',
    77: 'Snow grains',
    80: 'Light rain showers',
    81: 'Moderate rain showers',
    82: 'Heavy rain showers',
    85: 'Light snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with light hail',
    99: 'Thunderstorm with heavy hail',
  };
  return descriptions[code] || 'Unknown';
};