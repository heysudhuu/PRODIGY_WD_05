(function() {
    const API_KEY = '303dd627223f467890883612252007';
    const API_BASE_URL = 'https://api.weatherapi.com/v1';

    const appState = {
        weatherData: null,
        history: JSON.parse(localStorage.getItem('weatherHistory')) || [],
        currentUnit: localStorage.getItem('weatherUnit') || 'metric', // metric or imperial
    };

    const DOMElements = {
        body: document.body,
        searchBtn: document.getElementById("searchBtn"),
        locationBtn: document.getElementById("locationBtn"),
        cityInput: document.getElementById("cityInput"),
        autocompleteResults: document.getElementById("autocompleteResults"),
        weatherContent: document.getElementById("weatherContent"),
        loader: document.getElementById("loader"),
        historyContainer: document.getElementById("searchHistory"),
        // Main Card
        cityName: document.getElementById("cityName"),
        localTime: document.getElementById("localTime"),
        weatherIcon: document.getElementById("weatherIcon"),
        temp: document.getElementById("temp"),
        condition: document.getElementById("condition"),
        // Details Grid
        feelsLike: document.getElementById("feelsLike"),
        humidity: document.getElementById("humidity"),
        wind: document.getElementById("wind"),
        visibility: document.getElementById("visibility"),
        pressure: document.getElementById("pressure"),
        chanceOfRain: document.getElementById("chanceOfRain"),
        // Astronomy
        sunrise: document.getElementById("sunrise"),
        sunset: document.getElementById("sunset"),
        moonrise: document.getElementById("moonrise"),
        moonset: document.getElementById("moonset"),
        moon_phase: document.getElementById("moon_phase"),
        // UV & AQI
        uvNeedle: document.getElementById("uvNeedle"),
        uvText: document.getElementById("uvText"),
        aqiValue: document.getElementById("aqiValue"),
        aqiText: document.getElementById("aqiText"),
        aqiDetails: document.getElementById("aqiDetails"),
        // Forecasts & Alerts
        hourlyGrid: document.getElementById("hourlyGrid"),
        forecastGrid: document.getElementById("forecastGrid"),
        alertContainer: document.getElementById("alertContainer"),
        alerts: document.getElementById("alerts"),
        // Modals
        errorModal: document.getElementById("errorModal"),
        errorMsg: document.getElementById("errorMsg"),
        hourlyDetailModal: document.getElementById("hourlyDetailModal"),
        hourlyDetailContent: document.getElementById("hourlyDetailContent"),
        // Toggles
        themeCheckbox: document.getElementById('theme-checkbox'),
        unitSwitch: document.getElementById('unitSwitch'),
    };

    const managers = {
        theme: {
            init: function() {
                const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                const savedTheme = localStorage.getItem('theme');
                if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
                    DOMElements.body.classList.remove('light-theme');
                    DOMElements.themeCheckbox.checked = true;
                } else {
                    DOMElements.body.classList.add('light-theme');
                    DOMElements.themeCheckbox.checked = false;
                }
            },
            toggle: function() {
                if (DOMElements.themeCheckbox.checked) {
                    DOMElements.body.classList.remove('light-theme');
                    localStorage.setItem('theme', 'dark');
                } else {
                    DOMElements.body.classList.add('light-theme');
                    localStorage.setItem('theme', 'light');
                }
            }
        },
        units: {
            init: function() {
                DOMElements.unitSwitch.checked = appState.currentUnit === 'imperial';
            },
            toggle: function() {
                appState.currentUnit = DOMElements.unitSwitch.checked ? 'imperial' : 'metric';
                localStorage.setItem('weatherUnit', appState.currentUnit);
                renderAllUI();
            }
        }
    };

    function init() {
        managers.theme.init();
        managers.units.init();
        addEventListeners();
        renderSearchHistory();
        const lastCity = appState.history[0];
        if (lastCity) {
            getWeatherData(lastCity);
        } else {
            navigator.geolocation.getCurrentPosition(
                (pos) => handleLocation(pos.coords),
                () => console.log("Geolocation denied. Waiting for user input.")
            );
        }
    }

    function addEventListeners() {
        DOMElements.searchBtn.addEventListener("click", handleSearch);
        DOMElements.locationBtn.addEventListener("click", () => navigator.geolocation.getCurrentPosition(pos => handleLocation(pos.coords), () => displayError("Failed to get location.")));
        DOMElements.cityInput.addEventListener("keydown", (e) => e.key === 'Enter' && handleSearch());
        DOMElements.cityInput.addEventListener("input", handleAutocomplete);
        DOMElements.themeCheckbox.addEventListener('change', managers.theme.toggle);
        DOMElements.unitSwitch.addEventListener('change', managers.units.toggle);
        
        document.addEventListener("click", (e) => {
            if (!DOMElements.autocompleteResults.contains(e.target)) {
                 DOMElements.autocompleteResults.innerHTML = '';
            }
            if (e.target.classList.contains('close-button')) {
                e.target.closest('.modal').classList.add('hidden');
            }
        });

        DOMElements.historyContainer.addEventListener("click", (e) => {
            if (e.target.tagName === 'BUTTON') getWeatherData(e.target.textContent);
        });
    }

    async function handleSearch() {
        const city = DOMElements.cityInput.value.trim();
        DOMElements.autocompleteResults.innerHTML = '';
        if (!city) return displayError("Please enter a city name.");
        await getWeatherData(city);
    }

    async function handleLocation(coords) {
        await getWeatherData(`${coords.latitude},${coords.longitude}`);
    }
    
    let autocompleteTimeout;
    async function handleAutocomplete(e) {
        const query = e.target.value;
        clearTimeout(autocompleteTimeout);
        if (query.length < 3) {
            DOMElements.autocompleteResults.innerHTML = '';
            return;
        }
        autocompleteTimeout = setTimeout(async () => {
            try {
                const url = `${API_BASE_URL}/search.json?key=${API_KEY}&q=${query}`;
                const response = await fetch(url);
                const results = await response.json();
                renderAutocomplete(results);
            } catch (error) {
                console.error("Autocomplete failed", error);
            }
        }, 300);
    }

    async function getWeatherData(location) {
        toggleLoader(true);
        try {
            const url = `${API_BASE_URL}/forecast.json?key=${API_KEY}&q=${location}&days=6&aqi=yes&alerts=yes`;
            const response = await fetch(url);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error.message || "Failed to fetch weather data.");
            }
            appState.weatherData = await response.json();
            renderAllUI();
            updateSearchHistory(appState.weatherData.location.name);
        } catch (error) {
            displayError(error.message);
        } finally {
            toggleLoader(false);
        }
    }

    function renderAllUI() {
        if (!appState.weatherData) return;
        const { current, location, forecast } = appState.weatherData;
        const isMetric = appState.currentUnit === 'metric';

        DOMElements.cityName.textContent = `${location.name}, ${location.country}`;
        DOMElements.localTime.textContent = new Date(location.localtime_epoch * 1000).toLocaleString();
        DOMElements.temp.textContent = isMetric ? `${Math.round(current.temp_c)}°C` : `${Math.round(current.temp_f)}°F`;
        DOMElements.condition.textContent = current.condition.text;
        DOMElements.weatherIcon.src = `https:${current.condition.icon}`;

        DOMElements.feelsLike.innerHTML = `<span>Feels Like</span>${isMetric ? Math.round(current.feelslike_c) : Math.round(current.feelslike_f)}°`;
        DOMElements.humidity.innerHTML = `<span>Humidity</span>${current.humidity}%`;
        DOMElements.wind.innerHTML = `<span>Wind</span>${isMetric ? current.wind_kph : current.wind_mph} ${isMetric ? 'kph' : 'mph'}`;
        DOMElements.visibility.innerHTML = `<span>Visibility</span>${isMetric ? current.vis_km : current.vis_miles} ${isMetric ? 'km' : 'miles'}`;
        DOMElements.pressure.innerHTML = `<span>Pressure</span>${isMetric ? current.pressure_mb : current.pressure_in} ${isMetric ? 'mb' : 'in'}`;
        DOMElements.chanceOfRain.innerHTML = `<span>Chance of Rain</span>${forecast.forecastday[0].day.daily_chance_of_rain}%`;

        const astro = forecast.forecastday[0].astro;
        DOMElements.sunrise.innerHTML = `<span>Sunrise</span>${astro.sunrise}`;
        DOMElements.sunset.innerHTML = `<span>Sunset</span>${astro.sunset}`;
        DOMElements.moonrise.innerHTML = `<span>Moonrise</span>${astro.moonrise}`;
        DOMElements.moonset.innerHTML = `<span>Moonset</span>${astro.moonset}`;
        DOMElements.moon_phase.innerHTML = `<span>Phase</span>${astro.moon_phase}`;

        renderUvIndex(current.uv);
        renderAirQuality(current.air_quality);
        renderHourlyForecast(forecast.forecastday[0].hour);
        renderDailyForecast(forecast.forecastday);
        renderAlerts(appState.weatherData.alerts);

        DOMElements.weatherContent.classList.remove("hidden");
    }

    function renderAutocomplete(results) {
        DOMElements.autocompleteResults.innerHTML = '';
        if (!results || results.length === 0) return;
        results.forEach(loc => {
            const item = document.createElement('div');
            item.textContent = `${loc.name}, ${loc.region}, ${loc.country}`;
            item.onclick = () => {
                DOMElements.cityInput.value = item.textContent;
                DOMElements.autocompleteResults.innerHTML = '';
                getWeatherData(item.textContent);
            };
            DOMElements.autocompleteResults.appendChild(item);
        });
    }

    function renderHourlyForecast(hourly) {
        DOMElements.hourlyGrid.innerHTML = '';
        const now = new Date();
        hourly.filter(hour => new Date(hour.time_epoch * 1000) > now).slice(0, 12).forEach(hour => {
            const card = document.createElement('div');
            card.className = 'hourly-card';
            card.onclick = () => showHourlyDetailModal(hour);

            const temp = appState.currentUnit === 'metric' ? hour.temp_c : hour.temp_f;
            const feelsLike = appState.currentUnit === 'metric' ? hour.feelslike_c : hour.feelslike_f;
            card.innerHTML = `
                <p>${new Date(hour.time_epoch * 1000).getHours()}:00</p>
                <img src="https:${hour.condition.icon}" alt="${hour.condition.text}">
                <p><strong>${Math.round(temp)}°</strong></p>
                <p class="feels-like">${Math.round(feelsLike)}°</p>
            `;
            DOMElements.hourlyGrid.appendChild(card);
        });
    }

    function renderDailyForecast(daily) {
        DOMElements.forecastGrid.innerHTML = '';
        daily.slice(1).forEach(day => {
            const card = document.createElement('div');
            card.className = 'forecast-card';
            const isMetric = appState.currentUnit === 'metric';
            const maxTemp = isMetric ? day.day.maxtemp_c : day.day.maxtemp_f;
            const minTemp = isMetric ? day.day.mintemp_c : day.day.mintemp_f;
            card.innerHTML = `
                <p class="day">${new Date(day.date_epoch * 1000).toLocaleDateString('en-US', { weekday: 'short' })}</p>
                <img src="https:${day.day.condition.icon}" alt="${day.day.condition.text}">
                <p>${day.day.condition.text}</p>
                <p class="temps">${Math.round(maxTemp)}° / ${Math.round(minTemp)}°</p>
            `;
            DOMElements.forecastGrid.appendChild(card);
        });
    }
    
    function showHourlyDetailModal(hour) {
        const isMetric = appState.currentUnit === 'metric';
        DOMElements.hourlyDetailContent.innerHTML = `
            <span class="close-button">&times;</span>
            <h2>Details for ${new Date(hour.time_epoch * 1000).toLocaleTimeString()}</h2>
            <div class="details-grid">
                <p><span>Condition</span>${hour.condition.text}</p>
                <p><span>Temp</span>${isMetric ? hour.temp_c : hour.temp_f}°</p>
                <p><span>Feels Like</span>${isMetric ? hour.feelslike_c : hour.feelslike_f}°</p>
                <p><span>Humidity</span>${hour.humidity}%</p>
                <p><span>Wind</span>${isMetric ? hour.wind_kph : hour.wind_mph} ${isMetric ? 'kph' : 'mph'} (${hour.wind_dir})</p>
                <p><span>Gusts</span>${isMetric ? hour.gust_kph : hour.gust_mph} ${isMetric ? 'kph' : 'mph'}</p>
                <p><span>Chance of Rain</span>${hour.chance_of_rain}%</p>
                <p><span>Chance of Snow</span>${hour.chance_of_snow}%</p>
            </div>`;
        DOMElements.hourlyDetailModal.classList.remove('hidden');
    }

    function renderAirQuality(aqi) {
        const aqiValue = aqi['us-epa-index'];
        let aqiText;
        if (aqiValue === 1) aqiText = 'Good'; else if (aqiValue === 2) aqiText = 'Moderate';
        else if (aqiValue === 3) aqiText = 'Unhealthy for sensitive groups'; else if (aqiValue === 4) aqiText = 'Unhealthy';
        else if (aqiValue === 5) aqiText = 'Very Unhealthy'; else aqiText = 'Hazardous';
        DOMElements.aqiValue.textContent = aqiValue;
        DOMElements.aqiText.textContent = aqiText;

        DOMElements.aqiDetails.innerHTML = `
            <div><span>CO:</span> ${aqi.co.toFixed(1)}</div> <div><span>O3:</span> ${aqi.o3.toFixed(1)}</div>
            <div><span>NO2:</span> ${aqi.no2.toFixed(1)}</div> <div><span>SO2:</span> ${aqi.so2.toFixed(1)}</div>
            <div><span>PM2.5:</span> ${aqi.pm2_5.toFixed(1)}</div> <div><span>PM10:</span> ${aqi.pm10.toFixed(1)}</div>
        `;
    }

    function renderUvIndex(uv) {
        let rotation = -90 + (uv / 11) * 180;
        rotation = Math.max(-90, Math.min(90, rotation)); // Clamp value
        DOMElements.uvNeedle.style.transform = `rotate(${rotation}deg)`;
        DOMElements.uvText.textContent = uv;
    }

    function renderAlerts(alertsData) {
        if (alertsData.alert && alertsData.alert.length > 0) {
            DOMElements.alertContainer.classList.remove("hidden");
            DOMElements.alerts.innerHTML = alertsData.alert.map(alert => `<p><strong>${alert.headline}</strong>: ${alert.desc}</p>`).join('');
        } else {
            DOMElements.alertContainer.classList.add("hidden");
        }
    }

    function updateSearchHistory(city) {
        if (!city) return;
        const history = appState.history;
        const existingIndex = history.map(item => item.toLowerCase()).indexOf(city.toLowerCase());
        if (existingIndex > -1) history.splice(existingIndex, 1);
        history.unshift(city);
        if (history.length > 4) history.pop();
        appState.history = history;
        localStorage.setItem('weatherHistory', JSON.stringify(history));
        renderSearchHistory();
    }

    function renderSearchHistory() {
        DOMElements.historyContainer.innerHTML = appState.history.map(city => `<button>${city}</button>`).join('');
    }

    function toggleLoader(show) {
        DOMElements.loader.classList.toggle("hidden", !show);
        if (show) DOMElements.weatherContent.classList.add("hidden");
    }

    function displayError(message) {
        DOMElements.errorMsg.textContent = `❌ ${message}`;
        DOMElements.errorModal.classList.remove("hidden");
    }

    init();
})();