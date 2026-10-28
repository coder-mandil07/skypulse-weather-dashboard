/**
 * SkyPulse — Real-Time Weather Dashboard
 * Vanilla JavaScript ES6+
 * Powered by Open-Meteo Geocoding & Forecast APIs
 */

'use strict';

// =============================================================================
// API Configuration & Constants
// =============================================================================

const GEOCODING_API_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const WEATHER_API_URL = 'https://api.open-meteo.com/v1/forecast';
const DEFAULT_CITY = 'New Delhi';

// Global state controller for request cancellation and active city
let currentAbortController = null;
let currentCityData = null;

// =============================================================================
// DOM Elements
// =============================================================================

const elements = {
  // Search elements
  searchForm: document.getElementById('searchForm'),
  cityInput: document.getElementById('cityInput'),
  clearBtn: document.getElementById('clearBtn'),
  searchBtn: document.getElementById('searchBtn'),
  matchesDropdown: document.getElementById('matchesDropdown'),
  quickChips: document.querySelectorAll('.chip'),

  // Error elements
  errorBanner: document.getElementById('errorBanner'),
  errorTitle: document.getElementById('errorTitle'),
  errorMessage: document.getElementById('errorMessage'),
  closeErrorBtn: document.getElementById('closeErrorBtn'),

  // Loading elements
  loadingOverlay: document.getElementById('loadingOverlay'),
  loadingText: document.getElementById('loadingText'),

  // Weather Hero elements
  weatherHero: document.getElementById('weatherHero'),
  cityName: document.getElementById('cityName'),
  countryBadge: document.getElementById('countryBadge'),
  regionText: document.getElementById('regionText'),
  localTime: document.getElementById('localTime'),
  localDate: document.getElementById('localDate'),
  weatherIconWrapper: document.getElementById('weatherIconWrapper'),
  conditionText: document.getElementById('conditionText'),
  dayNightIndicator: document.getElementById('dayNightIndicator'),
  currentTemp: document.getElementById('currentTemp'),
  coordText: document.getElementById('coordText'),
  timezoneText: document.getElementById('timezoneText'),

  // Metrics elements
  feelsLikeTemp: document.getElementById('feelsLikeTemp'),
  feelsLikeDesc: document.getElementById('feelsLikeDesc'),
  feelsLikeBar: document.getElementById('feelsLikeBar'),

  humidityValue: document.getElementById('humidityValue'),
  humidityDesc: document.getElementById('humidityDesc'),
  humidityBar: document.getElementById('humidityBar'),

  windSpeedValue: document.getElementById('windSpeedValue'),
  windSpeedDesc: document.getElementById('windSpeedDesc'),
  windBar: document.getElementById('windBar'),

  precipitationValue: document.getElementById('precipitationValue'),
  precipitationDesc: document.getElementById('precipitationDesc'),
  precipBar: document.getElementById('precipBar'),
};

// =============================================================================
// SVG Weather Icons (Sanitized Trusted Templates)
// =============================================================================

const SVG_ICONS = {
  clearDay: `
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="32" cy="32" r="14" fill="#fbbf24" stroke="#f59e0b" stroke-width="3"/>
      <line x1="32" y1="6" x2="32" y2="12" stroke="#f59e0b" stroke-width="3"/>
      <line x1="32" y1="52" x2="32" y2="58" stroke="#f59e0b" stroke-width="3"/>
      <line x1="6" y1="32" x2="12" y2="32" stroke="#f59e0b" stroke-width="3"/>
      <line x1="52" y1="32" x2="58" y2="32" stroke="#f59e0b" stroke-width="3"/>
      <line x1="13.6" y1="13.6" x2="17.8" y2="17.8" stroke="#f59e0b" stroke-width="3"/>
      <line x1="46.2" y1="46.2" x2="50.4" y2="50.4" stroke="#f59e0b" stroke-width="3"/>
      <line x1="13.6" y1="50.4" x2="17.8" y2="46.2" stroke="#f59e0b" stroke-width="3"/>
      <line x1="46.2" y1="17.8" x2="50.4" y2="13.6" stroke="#f59e0b" stroke-width="3"/>
    </svg>`,

  clearNight: `
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M44 38A20 20 0 1 1 26 20a16 16 0 0 0 18 18z" fill="#93c5fd" stroke="#60a5fa" stroke-width="3"/>
      <circle cx="48" cy="18" r="1.5" fill="#e0e7ff"/>
      <circle cx="38" cy="12" r="1.2" fill="#e0e7ff"/>
      <circle cx="54" cy="28" r="1.5" fill="#e0e7ff"/>
    </svg>`,

  partlyCloudyDay: `
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="26" cy="24" r="10" fill="#fbbf24" stroke="#f59e0b" stroke-width="2.5"/>
      <line x1="26" y1="6" x2="26" y2="10" stroke="#f59e0b" stroke-width="2.5"/>
      <line x1="10" y1="24" x2="14" y2="24" stroke="#f59e0b" stroke-width="2.5"/>
      <line x1="14.7" y1="12.7" x2="17.5" y2="15.5" stroke="#f59e0b" stroke-width="2.5"/>
      <line x1="37.3" y1="12.7" x2="34.5" y2="15.5" stroke="#f59e0b" stroke-width="2.5"/>
      <path d="M46 48H22a12 12 0 0 1-1.8-23.9A15 15 0 0 1 48 28.5 10 10 0 0 1 46 48z" fill="#94a3b8" stroke="#cbd5e1" stroke-width="3"/>
    </svg>`,

  partlyCloudyNight: `
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M38 28A14 14 0 0 1 24 14a12 12 0 0 0 14 14z" fill="#93c5fd" stroke="#60a5fa" stroke-width="2.5"/>
      <path d="M46 50H22a12 12 0 0 1-1.8-23.9A15 15 0 0 1 48 30.5 10 10 0 0 1 46 50z" fill="#64748b" stroke="#94a3b8" stroke-width="3"/>
    </svg>`,

  overcast: `
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M48 46H20a12 12 0 0 1-2.2-23.8A16 16 0 0 1 48 26a11 11 0 0 1 0 20z" fill="#64748b" stroke="#94a3b8" stroke-width="3"/>
      <path d="M36 34H18a8 8 0 0 1-1.5-15.8A11 11 0 0 1 36 20a7 7 0 0 1 0 14z" fill="#475569" stroke="#64748b" stroke-width="2.5" opacity="0.7"/>
    </svg>`,

  fog: `
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M46 36H18a10 10 0 0 1-1.8-19.8A13 13 0 0 1 47 20a9 9 0 0 1-1 16z" fill="#64748b" stroke="#94a3b8" stroke-width="2.5"/>
      <line x1="16" y1="44" x2="48" y2="44" stroke="#cbd5e1" stroke-width="3"/>
      <line x1="20" y1="50" x2="44" y2="50" stroke="#94a3b8" stroke-width="3"/>
      <line x1="24" y1="56" x2="40" y2="56" stroke="#64748b" stroke-width="3"/>
    </svg>`,

  drizzle: `
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M46 36H20a10 10 0 0 1-2-19.8A13 13 0 0 1 47 20a9 9 0 0 1-1 16z" fill="#64748b" stroke="#94a3b8" stroke-width="3"/>
      <line x1="24" y1="44" x2="22" y2="48" stroke="#38bdf8" stroke-width="2.5"/>
      <line x1="34" y1="44" x2="32" y2="48" stroke="#38bdf8" stroke-width="2.5"/>
      <line x1="44" y1="44" x2="42" y2="48" stroke="#38bdf8" stroke-width="2.5"/>
      <line x1="29" y1="52" x2="27" y2="56" stroke="#38bdf8" stroke-width="2.5"/>
      <line x1="39" y1="52" x2="37" y2="56" stroke="#38bdf8" stroke-width="2.5"/>
    </svg>`,

  rain: `
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M46 34H20a11 11 0 0 1-2-21.8A14 14 0 0 1 47 16a10 10 0 0 1-1 18z" fill="#475569" stroke="#94a3b8" stroke-width="3"/>
      <line x1="22" y1="42" x2="18" y2="52" stroke="#38bdf8" stroke-width="3"/>
      <line x1="34" y1="42" x2="30" y2="52" stroke="#38bdf8" stroke-width="3"/>
      <line x1="46" y1="42" x2="42" y2="52" stroke="#38bdf8" stroke-width="3"/>
    </svg>`,

  snow: `
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M46 34H20a11 11 0 0 1-2-21.8A14 14 0 0 1 47 16a10 10 0 0 1-1 18z" fill="#475569" stroke="#cbd5e1" stroke-width="3"/>
      <circle cx="22" cy="46" r="2.5" fill="#e0f2fe"/>
      <circle cx="34" cy="46" r="2.5" fill="#e0f2fe"/>
      <circle cx="46" cy="46" r="2.5" fill="#e0f2fe"/>
      <circle cx="28" cy="54" r="2.5" fill="#e0f2fe"/>
      <circle cx="40" cy="54" r="2.5" fill="#e0f2fe"/>
    </svg>`,

  thunderstorm: `
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M46 32H20a11 11 0 0 1-2-21.8A14 14 0 0 1 47 14a10 10 0 0 1-1 18z" fill="#334155" stroke="#64748b" stroke-width="3"/>
      <polygon points="32 32 24 45 32 45 28 58 42 42 34 42 38 32" fill="#fbbf24" stroke="#f59e0b" stroke-width="2"/>
    </svg>`,
};

// =============================================================================
// WMO Weather Code Mapping (0 - 99)
// =============================================================================

/**
 * Maps WMO weather code and day/night status to description, icon, and theme.
 * @param {number} code - WMO weather interpretation code.
 * @param {number} isDay - 1 for daytime, 0 for nighttime.
 * @returns {object} { label, iconSvg, theme }
 */
function getWeatherConditionMeta(code, isDay) {
  const isDaytime = Number(isDay) === 1;

  switch (code) {
    case 0:
      return {
        label: isDaytime ? 'Clear Sky' : 'Clear Night',
        iconSvg: isDaytime ? SVG_ICONS.clearDay : SVG_ICONS.clearNight,
        theme: isDaytime ? 'theme-day' : 'theme-night',
      };
    case 1:
      return {
        label: isDaytime ? 'Mainly Clear' : 'Mainly Clear Night',
        iconSvg: isDaytime ? SVG_ICONS.clearDay : SVG_ICONS.clearNight,
        theme: isDaytime ? 'theme-day' : 'theme-night',
      };
    case 2:
      return {
        label: 'Partly Cloudy',
        iconSvg: isDaytime ? SVG_ICONS.partlyCloudyDay : SVG_ICONS.partlyCloudyNight,
        theme: isDaytime ? 'theme-day' : 'theme-night',
      };
    case 3:
      return {
        label: 'Overcast',
        iconSvg: SVG_ICONS.overcast,
        theme: isDaytime ? 'theme-day' : 'theme-night',
      };
    case 45:
      return {
        label: 'Foggy',
        iconSvg: SVG_ICONS.fog,
        theme: isDaytime ? 'theme-day' : 'theme-night',
      };
    case 48:
      return {
        label: 'Depositing Rime Fog',
        iconSvg: SVG_ICONS.fog,
        theme: isDaytime ? 'theme-day' : 'theme-night',
      };
    case 51:
      return {
        label: 'Light Drizzle',
        iconSvg: SVG_ICONS.drizzle,
        theme: 'theme-rain',
      };
    case 53:
      return {
        label: 'Moderate Drizzle',
        iconSvg: SVG_ICONS.drizzle,
        theme: 'theme-rain',
      };
    case 55:
      return {
        label: 'Dense Drizzle',
        iconSvg: SVG_ICONS.drizzle,
        theme: 'theme-rain',
      };
    case 56:
    case 57:
      return {
        label: 'Freezing Drizzle',
        iconSvg: SVG_ICONS.drizzle,
        theme: 'theme-snow',
      };
    case 61:
      return {
        label: 'Slight Rain',
        iconSvg: SVG_ICONS.rain,
        theme: 'theme-rain',
      };
    case 63:
      return {
        label: 'Moderate Rain',
        iconSvg: SVG_ICONS.rain,
        theme: 'theme-rain',
      };
    case 65:
      return {
        label: 'Heavy Rain',
        iconSvg: SVG_ICONS.rain,
        theme: 'theme-rain',
      };
    case 66:
    case 67:
      return {
        label: 'Freezing Rain',
        iconSvg: SVG_ICONS.rain,
        theme: 'theme-snow',
      };
    case 71:
      return {
        label: 'Slight Snow Fall',
        iconSvg: SVG_ICONS.snow,
        theme: 'theme-snow',
      };
    case 73:
      return {
        label: 'Moderate Snow Fall',
        iconSvg: SVG_ICONS.snow,
        theme: 'theme-snow',
      };
    case 75:
      return {
        label: 'Heavy Snow Fall',
        iconSvg: SVG_ICONS.snow,
        theme: 'theme-snow',
      };
    case 77:
      return {
        label: 'Snow Grains',
        iconSvg: SVG_ICONS.snow,
        theme: 'theme-snow',
      };
    case 80:
      return {
        label: 'Slight Rain Showers',
        iconSvg: SVG_ICONS.rain,
        theme: 'theme-rain',
      };
    case 81:
      return {
        label: 'Moderate Rain Showers',
        iconSvg: SVG_ICONS.rain,
        theme: 'theme-rain',
      };
    case 82:
      return {
        label: 'Violent Rain Showers',
        iconSvg: SVG_ICONS.rain,
        theme: 'theme-rain',
      };
    case 85:
      return {
        label: 'Slight Snow Showers',
        iconSvg: SVG_ICONS.snow,
        theme: 'theme-snow',
      };
    case 86:
      return {
        label: 'Heavy Snow Showers',
        iconSvg: SVG_ICONS.snow,
        theme: 'theme-snow',
      };
    case 95:
      return {
        label: 'Thunderstorm',
        iconSvg: SVG_ICONS.thunderstorm,
        theme: 'theme-rain',
      };
    case 96:
    case 99:
      return {
        label: 'Thunderstorm with Hail',
        iconSvg: SVG_ICONS.thunderstorm,
        theme: 'theme-rain',
      };
    default:
      return {
        label: 'Clear Sky',
        iconSvg: isDaytime ? SVG_ICONS.clearDay : SVG_ICONS.clearNight,
        theme: isDaytime ? 'theme-day' : 'theme-night',
      };
  }
}

// =============================================================================
// Helper Functions: Formatting & Comfort Metrics
// =============================================================================

/**
 * Formats local date and time from ISO string and timezone offset.
 * @param {string} isoString - ISO formatted time e.g. "2026-10-26T12:00"
 * @param {string} timezone - Timezone name e.g. "Asia/Kolkata"
 * @returns {object} { formattedTime, formattedDate }
 */
function formatLocalDateTime(isoString, timezone) {
  try {
    if (!isoString) {
      return { formattedTime: '--:--', formattedDate: 'Date unavailable' };
    }

    const date = new Date(isoString);
    if (isNaN(date.getTime())) {
      // Fallback: manually parse ISO string
      const [datePart, timePart] = isoString.split('T');
      return {
        formattedTime: timePart || '--:--',
        formattedDate: datePart || 'Today',
      };
    }

    // Format time (e.g. "12:00 PM")
    const timeOptions = {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    };

    // Format date (e.g. "Monday, Oct 26, 2026")
    const dateOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };

    const formattedTime = new Intl.DateTimeFormat('en-US', timeOptions).format(date);
    const formattedDate = new Intl.DateTimeFormat('en-US', dateOptions).format(date);

    return { formattedTime, formattedDate };
  } catch (err) {
    console.warn('Error formatting local time:', err);
    return { formattedTime: '--:--', formattedDate: 'Date unavailable' };
  }
}

/**
 * Provides qualitative descriptor for humidity level.
 */
function getHumidityDescriptor(value) {
  if (value < 30) return 'Low humidity &bull; Dry air';
  if (value <= 60) return 'Comfortable humidity level';
  if (value <= 80) return 'Moderate humidity &bull; Humid';
  return 'High humidity &bull; Very muggy';
}

/**
 * Provides qualitative descriptor for wind speed.
 */
function getWindDescriptor(kmh) {
  if (kmh < 1) return 'Calm';
  if (kmh <= 5) return 'Light air';
  if (kmh <= 11) return 'Light breeze';
  if (kmh <= 19) return 'Gentle breeze';
  if (kmh <= 28) return 'Moderate breeze';
  if (kmh <= 38) return 'Fresh breeze';
  if (kmh <= 49) return 'Strong breeze';
  return 'High wind / Gale';
}

/**
 * Provides qualitative descriptor for feels-like temperature compared to actual.
 */
function getFeelsLikeDescriptor(feelsLike, actual) {
  const diff = Math.round((feelsLike - actual) * 10) / 10;
  if (Math.abs(diff) < 0.5) return 'Similar to actual temperature';
  if (diff > 0) return `Feels ${diff.toFixed(1)}°C warmer`;
  return `Feels ${Math.abs(diff).toFixed(1)}°C cooler`;
}

// =============================================================================
// API Service Functions
// =============================================================================

/**
 * Searches cities using Open-Meteo Geocoding API.
 * @param {string} query - Name of the city to search.
 * @param {AbortSignal} signal - AbortSignal for race condition prevention.
 * @returns {Promise<Array>} Array of candidate city objects.
 */
async function searchCities(query, signal) {
  const trimmed = query.trim();
  if (!trimmed) {
    throw new Error('Please enter a city name to search.');
  }

  const endpoint = `${GEOCODING_API_URL}?name=${encodeURIComponent(trimmed)}&count=5&language=en&format=json`;

  const response = await fetch(endpoint, { signal });

  if (!response.ok) {
    throw new Error(`Geocoding server responded with status: ${response.status} (${response.statusText})`);
  }

  const data = await response.json();

  if (!data || !Array.isArray(data.results) || data.results.length === 0) {
    throw new Error(`No matching city found for "${trimmed}". Please verify the spelling.`);
  }

  return data.results;
}

/**
 * Fetches current weather data using Open-Meteo Forecast API.
 * @param {number} latitude - Latitude coordinate.
 * @param {number} longitude - Longitude coordinate.
 * @param {AbortSignal} signal - AbortSignal for cancellation.
 * @returns {Promise<object>} Forecast response object.
 */
async function fetchWeatherData(latitude, longitude, signal) {
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    throw new Error('Invalid geographic coordinates provided for weather query.');
  }

  const endpoint = `${WEATHER_API_URL}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&timezone=auto`;

  const response = await fetch(endpoint, { signal });

  if (!response.ok) {
    throw new Error(`Weather service responded with status: ${response.status} (${response.statusText})`);
  }

  const data = await response.json();

  if (!data || !data.current) {
    throw new Error('Weather data payload is missing current observation fields.');
  }

  return data;
}

// =============================================================================
// UI Rendering Functions (Safe DOM Manipulation)
// =============================================================================

/**
 * Safely updates text content of a DOM element if present.
 */
function safeSetText(element, text) {
  if (element) {
    element.textContent = text !== null && text !== undefined ? String(text) : '--';
  }
}

/**
 * Renders the weather observation to the dashboard DOM.
 * @param {object} city - Selected city metadata from Geocoding API.
 * @param {object} weatherData - Meteorological response from Forecast API.
 */
function renderWeatherDashboard(city, weatherData) {
  const current = weatherData.current || {};
  const currentUnits = weatherData.current_units || {};

  // Extract metrics safely
  const temp = typeof current.temperature_2m === 'number' ? Math.round(current.temperature_2m) : '--';
  const feelsLike = typeof current.apparent_temperature === 'number' ? Math.round(current.apparent_temperature) : '--';
  const humidity = typeof current.relative_humidity_2m === 'number' ? current.relative_humidity_2m : '--';
  const windSpeed = typeof current.wind_speed_10m === 'number' ? current.wind_speed_10m : '--';
  const precip = typeof current.precipitation === 'number' ? current.precipitation : 0;
  const weatherCode = typeof current.weather_code === 'number' ? current.weather_code : 0;
  const isDay = typeof current.is_day === 'number' ? current.is_day : 1;

  // 1. Update City & Region Header
  safeSetText(elements.cityName, city.name || 'Unknown City');
  safeSetText(elements.countryBadge, city.country || city.country_code || '');

  const regionParts = [];
  if (city.admin1 && city.admin1 !== city.name) regionParts.push(city.admin1);
  if (city.admin2 && city.admin2 !== city.admin1) regionParts.push(city.admin2);
  const regionString = regionParts.length > 0 ? regionParts.join(', ') : (city.country || '');
  safeSetText(elements.regionText, regionString);

  // 2. Coordinates & Timezone
  const latDisplay = typeof city.latitude === 'number' 
    ? `${Math.abs(city.latitude).toFixed(2)}° ${city.latitude >= 0 ? 'N' : 'S'}` 
    : '';
  const lonDisplay = typeof city.longitude === 'number' 
    ? `${Math.abs(city.longitude).toFixed(2)}° ${city.longitude >= 0 ? 'E' : 'W'}` 
    : '';
  safeSetText(elements.coordText, `${latDisplay}, ${lonDisplay}`);

  const timezoneName = weatherData.timezone || city.timezone || 'Local Time';
  const tzAbbr = weatherData.timezone_abbreviation ? ` (${weatherData.timezone_abbreviation})` : '';
  safeSetText(elements.timezoneText, `${timezoneName}${tzAbbr}`);

  // 3. Date & Time
  const { formattedTime, formattedDate } = formatLocalDateTime(current.time, weatherData.timezone);
  safeSetText(elements.localTime, formattedTime);
  safeSetText(elements.localDate, formattedDate);

  // 4. Weather Condition, Icon & Day/Night Indicator
  const conditionMeta = getWeatherConditionMeta(weatherCode, isDay);
  safeSetText(elements.conditionText, conditionMeta.label);
  safeSetText(elements.dayNightIndicator, isDay === 1 ? 'Daytime' : 'Nighttime');

  // Inject Weather Icon (Sanitized static SVG markup)
  if (elements.weatherIconWrapper) {
    elements.weatherIconWrapper.innerHTML = conditionMeta.iconSvg;
  }

  // Update Body Theme
  document.body.className = conditionMeta.theme;

  // 5. Temperature
  safeSetText(elements.currentTemp, temp);

  // 6. Metrics Grid: Feels Like
  safeSetText(elements.feelsLikeTemp, feelsLike);
  if (typeof current.apparent_temperature === 'number' && typeof current.temperature_2m === 'number') {
    elements.feelsLikeDesc.innerHTML = getFeelsLikeDescriptor(current.apparent_temperature, current.temperature_2m);
    // Visual bar mapping (-10°C to 45°C -> 0% to 100%)
    const clampedTemp = Math.max(-10, Math.min(45, current.apparent_temperature));
    const percent = Math.round(((clampedTemp + 10) / 55) * 100);
    elements.feelsLikeBar.style.width = `${percent}%`;
  }

  // 7. Metrics Grid: Humidity
  safeSetText(elements.humidityValue, humidity);
  if (typeof current.relative_humidity_2m === 'number') {
    elements.humidityDesc.innerHTML = getHumidityDescriptor(current.relative_humidity_2m);
    elements.humidityBar.style.width = `${Math.min(100, Math.max(0, current.relative_humidity_2m))}%`;
  }

  // 8. Metrics Grid: Wind Speed
  safeSetText(elements.windSpeedValue, windSpeed);
  if (typeof current.wind_speed_10m === 'number') {
    safeSetText(elements.windSpeedDesc, getWindDescriptor(current.wind_speed_10m));
    // Wind bar (0 to 60 km/h)
    const windPercent = Math.min(100, Math.round((current.wind_speed_10m / 60) * 100));
    elements.windBar.style.width = `${windPercent}%`;
  }

  // 9. Metrics Grid: Precipitation
  safeSetText(elements.precipitationValue, precip);
  if (typeof current.precipitation === 'number') {
    const precipDesc = current.precipitation > 0 
      ? `Active precipitation (${current.precipitation} mm)` 
      : 'No precipitation detected';
    safeSetText(elements.precipitationDesc, precipDesc);
    const precipPercent = Math.min(100, Math.round((current.precipitation / 15) * 100));
    elements.precipBar.style.width = `${Math.max(precipPercent, current.precipitation > 0 ? 10 : 0)}%`;
  }
}

/**
 * Renders the disambiguation dropdown when multiple cities match the search.
 * @param {Array} cities - List of matched city candidate objects.
 */
function renderDisambiguationDropdown(cities) {
  if (!elements.matchesDropdown) return;

  // Clear previous entries
  elements.matchesDropdown.innerHTML = '';

  if (!cities || cities.length <= 1) {
    elements.matchesDropdown.classList.add('hidden');
    return;
  }

  cities.forEach((city, index) => {
    const item = document.createElement('div');
    item.className = 'match-item';
    item.setAttribute('role', 'option');
    item.setAttribute('tabindex', '0');
    if (index === 0) item.classList.add('selected');

    const mainDiv = document.createElement('div');
    mainDiv.className = 'match-main';

    const nameSpan = document.createElement('span');
    nameSpan.className = 'match-name';
    nameSpan.textContent = city.name || '';

    const subSpan = document.createElement('span');
    subSpan.className = 'match-sub';
    const subParts = [];
    if (city.admin1) subParts.push(city.admin1);
    if (city.country) subParts.push(city.country);
    subSpan.textContent = subParts.join(', ');

    mainDiv.appendChild(nameSpan);
    mainDiv.appendChild(subSpan);

    const badgeSpan = document.createElement('span');
    badgeSpan.className = 'match-badge';
    badgeSpan.textContent = city.country_code || (city.country ? city.country.slice(0, 3).toUpperCase() : 'LOC');

    item.appendChild(mainDiv);
    item.appendChild(badgeSpan);

    // Click handler to load selected city
    item.addEventListener('click', () => {
      elements.matchesDropdown.classList.add('hidden');
      loadCityWeather(city);
    });

    // Keyboard support (Enter / Space)
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        elements.matchesDropdown.classList.add('hidden');
        loadCityWeather(city);
      }
    });

    elements.matchesDropdown.appendChild(item);
  });

  elements.matchesDropdown.classList.remove('hidden');
}

// =============================================================================
// State Management: Loading & Error States
// =============================================================================

/**
 * Toggles the loading indicator and disables interactive buttons.
 */
function showLoading(isLoading, message = 'Fetching live weather observation...') {
  if (elements.loadingOverlay) {
    if (isLoading) {
      safeSetText(elements.loadingText, message);
      elements.loadingOverlay.classList.remove('hidden');
    } else {
      elements.loadingOverlay.classList.add('hidden');
    }
  }

  if (elements.searchBtn) {
    elements.searchBtn.disabled = isLoading;
  }
}

/**
 * Displays a user-friendly error banner.
 */
function showError(title, message) {
  if (elements.errorTitle) safeSetText(elements.errorTitle, title);
  if (elements.errorMessage) safeSetText(elements.errorMessage, message);
  if (elements.errorBanner) elements.errorBanner.classList.remove('hidden');
}

/**
 * Hides the error banner.
 */
function clearError() {
  if (elements.errorBanner) elements.errorBanner.classList.add('hidden');
}

// =============================================================================
// Core Application Controller
// =============================================================================

/**
 * Fetches and displays weather for a specific city object.
 * @param {object} city - City metadata (latitude, longitude, name, country).
 */
async function loadCityWeather(city) {
  // Abort any prior in-flight request
  if (currentAbortController) {
    currentAbortController.abort();
  }
  currentAbortController = new AbortController();
  const signal = currentAbortController.signal;

  clearError();
  showLoading(true, `Connecting to atmospheric stations for ${city.name}...`);

  try {
    const weatherData = await fetchWeatherData(city.latitude, city.longitude, signal);
    currentCityData = city;
    renderWeatherDashboard(city, weatherData);

    // Update active quick chip if applicable
    updateActiveChip(city.name);
  } catch (err) {
    if (err.name === 'AbortError') {
      console.log('Previous weather request cancelled by user action.');
      return;
    }
    console.error('Error loading weather data:', err);
    showError('Weather Service Error', err.message || 'Unable to retrieve meteorological data.');
  } finally {
    // Only dismiss loading if this controller is still current
    if (currentAbortController && currentAbortController.signal === signal) {
      showLoading(false);
    }
  }
}

/**
 * Handles city search workflow (Geocoding search + Weather fetch).
 * @param {string} cityName - Query entered by user.
 */
async function handleCitySearch(cityName) {
  const query = cityName.trim();

  if (!query) {
    showError('Search Input Required', 'Please enter a city or town name to fetch weather data.');
    elements.cityInput.focus();
    return;
  }

  // Abort any prior in-flight request
  if (currentAbortController) {
    currentAbortController.abort();
  }
  currentAbortController = new AbortController();
  const signal = currentAbortController.signal;

  clearError();
  elements.matchesDropdown.classList.add('hidden');
  showLoading(true, `Locating "${query}" coordinates...`);

  try {
    const matchedCities = await searchCities(query, signal);

    // If multiple candidates exist, display disambiguation dropdown
    if (matchedCities.length > 1) {
      renderDisambiguationDropdown(matchedCities);
    }

    // Default to top match immediately
    const primaryCity = matchedCities[0];
    await loadCityWeather(primaryCity);
  } catch (err) {
    if (err.name === 'AbortError') {
      console.log('Search request aborted.');
      return;
    }
    console.error('Geocoding search failed:', err);
    showError('Search Failed', err.message || 'Could not locate the requested city.');
    showLoading(false);
  }
}

/**
 * Synchronizes quick-action chip highlighting with current city.
 */
function updateActiveChip(cityName) {
  elements.quickChips.forEach(chip => {
    if (chip.dataset.city && chip.dataset.city.toLowerCase() === cityName.toLowerCase()) {
      chip.classList.add('active');
    } else {
      chip.classList.remove('active');
    }
  });
}

// =============================================================================
// Event Listeners & Initialization
// =============================================================================

function setupEventListeners() {
  // 1. Search Form Submission
  elements.searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    handleCitySearch(elements.cityInput.value);
  });

  // 2. Input change handlers & clear button toggle
  elements.cityInput.addEventListener('input', () => {
    const hasValue = elements.cityInput.value.trim().length > 0;
    elements.clearBtn.classList.toggle('hidden', !hasValue);
    if (!hasValue) {
      elements.matchesDropdown.classList.add('hidden');
    }
  });

  // 3. Clear button action
  elements.clearBtn.addEventListener('click', () => {
    elements.cityInput.value = '';
    elements.clearBtn.classList.add('hidden');
    elements.matchesDropdown.classList.add('hidden');
    elements.cityInput.focus();
  });

  // 4. Quick-action city chips
  elements.quickChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const city = chip.dataset.city;
      if (city) {
        elements.cityInput.value = city;
        elements.clearBtn.classList.remove('hidden');
        handleCitySearch(city);
      }
    });
  });

  // 5. Dismiss error banner
  elements.closeErrorBtn.addEventListener('click', clearError);

  // 6. Click outside to dismiss dropdown
  document.addEventListener('click', (e) => {
    if (!elements.searchForm.contains(e.target) && !elements.matchesDropdown.contains(e.target)) {
      elements.matchesDropdown.classList.add('hidden');
    }
  });

  // 7. Escape key closes dropdown and clears errors
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      elements.matchesDropdown.classList.add('hidden');
      clearError();
    }
  });
}

/**
 * Initializes application on DOMContentLoaded.
 */
async function init() {
  setupEventListeners();

  // Load default location (New Delhi)
  elements.cityInput.value = DEFAULT_CITY;
  elements.clearBtn.classList.remove('hidden');

  try {
    await handleCitySearch(DEFAULT_CITY);
  } catch (err) {
    console.error('Failed to load initial city:', err);
  }
}

// Start application
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
