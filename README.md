# Weather Dashboard

A sleek, modern, and feature-rich weather dashboard built with vanilla JavaScript, HTML5, and CSS3. This application provides real-time weather data, detailed forecasts, and advanced metrics with a beautiful, animated, and user-friendly interface.

![Weather Dashboard Screenshot](https://placehold.co/800x450/1f2937/f9fafb?text=Weather+Dashboard+UI)
*(Replace this placeholder with a screenshot of your application)*

---

## ✨ Features

This weather dashboard is packed with features designed to provide a comprehensive and enjoyable user experience.

### Core Functionality
- **Real-time Weather Data**: Get the current temperature, condition, "feels like" temperature, wind speed, humidity, and more.
- **Geolocation Support**: Automatically fetch weather for your current location on startup.
- **City/Zip Code Search**: Search for weather in any location worldwide.
- **Search History**: Your last 4 searched locations are saved for quick access.
- **5-Day Forecast**: View a detailed forecast for the next 5 days, including high/low temperatures and weather conditions.

### Advanced Data & Visualizations
- **Detailed Hourly Forecast**: View an hour-by-hour forecast for the next 24 hours, including temperature and "feels like" data.
- **Hourly Details Modal**: Click on any hour in the forecast to see a detailed modal with wind speed, gust speed, humidity, and chance of rain/snow.
- **Interactive UV Index Gauge**: A visual gauge displays the current UV index with corresponding severity levels.
- **Complete Astronomy Data**: View today's sunrise, sunset, moonrise, moonset, and the current moon phase.
- **Detailed Air Quality Index (AQI)**: See the current US EPA Air Quality Index value, its meaning, and a breakdown of individual pollutants (Ozone, NO2, SO2, PM2.5, PM10).
- **Weather Alerts**: Displays any active weather alerts or warnings for the selected location.

### UI/UX Enhancements
- **Autocomplete Search**: Get a list of matching locations as you type to prevent errors and speed up searches.
- **Light & Dark Themes**: Toggle between a beautiful dark mode and a clean light mode. Your preference is saved locally.
- **Metric & Imperial Units**: Switch between Celsius/kph and Fahrenheit/mph. Your preference is saved locally.
- **Professional Animations**: The entire interface is enhanced with smooth, subtle animations for loading content, hovering over elements, and displaying modals.
- **Fully Responsive Design**: The dashboard looks and works great on all devices, from mobile phones to desktop monitors.

---

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

You will need a modern web browser like Google Chrome, Firefox, or Microsoft Edge.

### Installation

1.  **Clone the repository:**
    ```sh
    git clone [https://github.com/your-username/weather-dashboard.git](https://github.com/your-username/weather-dashboard.git)
    ```
2.  **Navigate to the project directory:**
    ```sh
    cd weather-dashboard
    ```
3.  **Get a free API Key:**
    - Go to [WeatherAPI.com](https://www.weatherapi.com/) and sign up for a free account.
    - You will get a free API key on your dashboard.
4.  **Add your API Key:**
    - Open the `script.js` file.
    - Find the line `const API_KEY = 'your_api_key_here';` at the top of the file.
    - Replace `'your_api_key_here'` with the API key you obtained from WeatherAPI.com.
5.  **Run the application:**
    - Simply open the `index.html` file in your web browser.

---

## Usage

- **On first load**, the app will ask for your location to show local weather. If denied, you can use the search bar.
- **Use the search bar** to type a city name. The autocomplete will help you find the correct location.
- **Click on a recent search** button to quickly load weather for a previous location.
- **Toggle between °C and °F** using the switch in the header.
- **Toggle between light and dark themes** using the ☀️/🌙 icon.
- **Click on an hourly forecast card** to see more detailed information for that specific hour.

---

## 🛠️ Technologies Used

- **HTML5**: For the structure and content of the application.
- **CSS3**: For all styling, animations, and the responsive layout (including Flexbox and Grid).
- **Modern JavaScript (ES6+)**: For all application logic, API calls, and DOM manipulation. No external libraries or frameworks were used.
- **WeatherAPI.com**: For providing all weather, forecast, and astronomy data.

---

