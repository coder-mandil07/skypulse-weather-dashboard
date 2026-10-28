# SkyPulse — Real-Time Weather Dashboard

A modern, responsive, glassmorphic **Real-Time Weather Dashboard** web application built with semantic **HTML5**, **CSS3**, and **vanilla JavaScript**, powered by the free, open-source [Open-Meteo](https://open-meteo.com/) APIs without requiring any API keys.

---

## Live Features

- **Real-Time Weather Observation**:
  - Live temperature in **°C** (with prominent typography and atmospheric reading status).
  - Calculated **Feels-Like** temperature with comfort variance analysis.
  - **Humidity** percentage with qualitative comfort descriptions and visual level indicator.
  - **Wind Speed** in **km/h** at 10m altitude mapped to standard Beaufort descriptors.
  - **Precipitation** depth in **mm** with active detection status.
  - Weather condition labels (e.g. *Clear Sky*, *Partly Cloudy*, *Overcast*, *Light Drizzle*, *Thunderstorm*, *Snow*).
  - WMO weather code mapping (codes 0 to 99) with day/night SVG icon variations.
  - Dynamic local date and time formatting corresponding to the selected city's timezone.
  - Geographic coordinates (latitude & longitude) and timezone display pills.

- **Intelligent Search & Disambiguation**:
  - Search by city name with support for both the **Search** button and pressing **Enter**.
  - One-click **Clear** input button.
  - **Multiple Results Disambiguation Dropdown**: When searching cities with common names (e.g., *London*, *Paris*, *Springfield*), displays an accessible dropdown showing state/region and country so you can choose the exact location.
  - Quick-action chips for popular global cities (*New Delhi*, *Tokyo*, *London*, *New York*, *Sydney*, *Paris*).
  - Default initial location set to **New Delhi**.

- **Modern Glassmorphic UI/UX**:
  - Dynamic atmospheric background gradients that adapt based on day/night and precipitation status.
  - Frosted glass cards with `backdrop-filter: blur()`, glowing borders, and smooth elevation hover transitions.
  - Polished loading overlay with spinner while fetching fresh data.
  - Fully responsive across mobile (<640px), tablet (640px–980px), and desktop (>980px).
  - High-contrast typography and accessible keyboard navigation (`focus-visible`).

- **Robust Asynchronous Architecture**:
  - Pure ES6+ `async/await` with complete `try...catch...finally` handling.
  - HTTP `response.ok` status validation before parsing JSON.
  - **Race Condition Prevention**: Employs `AbortController` to immediately cancel stale or slower previous queries when a new search starts.
  - Resilient handling of network errors, empty inputs, and unrecognized city queries.
  - Safe DOM methods (`textContent`, `createElement`, `setAttribute`) to prevent any XSS vulnerabilities.

---

## API Endpoints Used

The dashboard relies exclusively on the free and open public APIs provided by [Open-Meteo](https://open-meteo.com/):

### 1. Geocoding API
Used to look up cities by name and resolve their geographic coordinates and metadata:
```
https://geocoding-api.open-meteo.com/v1/search?name={city}&count=5&language=en&format=json
```

### 2. Weather Forecast API
Used to retrieve real-time meteorological observations for the specified coordinates:
```
https://api.open-meteo.com/v1/forecast?latitude={latitude}&longitude={longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&timezone=auto
```

---

## Project Structure

```
weather-dashboard/
├── index.html        # Semantic HTML5 markup, search bar, hero card & metrics grid
├── style.css         # Glassmorphism design system, responsive styles & animations
├── script.js         # API integration, AbortController, WMO mapping & DOM rendering
└── README.md         # Documentation, API specifications, and setup instructions
```

---

## How to Run the Application

Because this application is built with vanilla HTML5, CSS3, and JavaScript, it requires **no build step, no npm packages, and no backend server**.

### Option 1: Open Directly in Any Web Browser
Simply double-click `index.html` or open it with your favorite browser:
- On Windows: Right-click `index.html` > **Open with** > **Google Chrome** (or Edge / Firefox / Safari).
- Or in PowerShell:
  ```powershell
  Start-Process "C:\Users\Harshit Mandil\.gemini\antigravity\scratch\weather-dashboard\index.html"
  ```

### Option 2: Local HTTP Server (Recommended)
Using Python's built-in HTTP server:
```powershell
# Navigate to the weather-dashboard directory
cd "C:\Users\Harshit Mandil\.gemini\antigravity\scratch\weather-dashboard"

# Start a local web server on port 8000
python -m http.server 8000
```
Then open your browser and navigate to:
```
http://localhost:8000
```

### Option 3: VS Code Live Server
If you are using Visual Studio Code:
1. Open the folder `weather-dashboard`.
2. Right-click `index.html` and select **Open with Live Server**.

---

## Testing & Edge Cases Handled

1. **Successful Search**: Searches for cities like *Tokyo*, *London*, *Berlin*, *Mumbai* successfully retrieve coordinates and live metrics.
2. **Ambiguous Search**: Searches for *London* (UK vs Canada) display the disambiguation dropdown with administrative regions.
3. **Empty Input**: Clicking search with an empty bar triggers an accessible validation banner prompting for input.
4. **Invalid City**: Non-existent city names (e.g. *xyzabc999*) trigger a user-friendly error notice without breaking the application.
5. **Rapid Successive Searches**: Typing or clicking multiple cities rapidly triggers `AbortController.abort()`, preventing race conditions and stale responses.
6. **Network / Offline Handling**: Network failures gracefully display a connection error message and dismiss the loading state.
