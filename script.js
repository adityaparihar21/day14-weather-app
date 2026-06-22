// ==========================================
// STATE & DOM ELEMENTS
// ==========================================
const DOM = {
    input: document.getElementById('city-input'),
    btn: document.getElementById('search-btn'),
    main: document.getElementById('main-content'),
    loading: document.getElementById('loading'),
    error: document.getElementById('error-message'),
    errorText: document.getElementById('error-text'),
    retryBtn: document.getElementById('retry-btn'),
    heroCard: document.getElementById('hero-card'),
    mouseLight: document.getElementById('mouse-light')
};

// ==========================================
// INITIALIZATION & EVENT LISTENERS
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    DOM.btn.addEventListener('click', handleSearch);
    DOM.input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
    DOM.retryBtn.addEventListener('click', () => {
        DOM.error.classList.add('hidden');
        DOM.input.focus();
    });

    // Global Mouse Tracking for Light Reflection
    document.addEventListener('mousemove', (e) => {
        document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
        document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
    });

    // Ask for location first
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                fetchWeatherDataByCoords(latitude, longitude);
            },
            (error) => {
                console.warn("Geolocation denied or failed. Defaulting to London.", error);
                fetchWeatherData('London');
            }
        );
    } else {
        // Fallback if geolocation is not supported
        fetchWeatherData('London');
    }

    // Modal Logic
    const modal = document.getElementById('metrics-modal');
    const modalClose = document.getElementById('modal-close');
    
    modalClose.addEventListener('click', () => {
        modal.classList.add('hidden');
    });
    
    modal.addEventListener('click', (e) => {
        if(e.target === modal) modal.classList.add('hidden');
    });

    document.querySelectorAll('.metric-card').forEach(card => {
        card.addEventListener('click', () => {
            const type = card.getAttribute('data-type');
            if(!type) return;
            
            // Read data from DOM
            let title = "", icon = "", val = "", unit = "", desc = "";
            
            switch(type) {
                case 'wind':
                    title = "Wind"; icon = "fas fa-wind";
                    val = document.getElementById('wind-speed').textContent; unit = "km/h";
                    const deg = window._currentMetrics.current.wind.deg;
                    const gust = window._currentMetrics.current.wind.gust;
                    desc = `
                        <p>${window._metricsDesc?.wind || "Data unavailable"}</p>
                        <div class="modal-rich-data">
                            <div class="rich-data-item"><span class="rich-label">Direction</span><span class="rich-val">${deg}°</span></div>
                            <div class="rich-data-item"><span class="rich-label">Gusts</span><span class="rich-val">${gust ? gust + ' km/h' : '--'}</span></div>
                        </div>
                    `;
                    break;
                case 'humidity':
                    title = "Humidity"; icon = "fas fa-tint";
                    val = document.getElementById('humidity-val').textContent; unit = "%";
                    const feelsLike = Math.round(window._currentMetrics.current.main.feels_like);
                    desc = `
                        <p>${window._metricsDesc?.humidity || "Data unavailable"}</p>
                        <div class="modal-rich-data">
                            <div class="rich-data-item"><span class="rich-label">Feels Like</span><span class="rich-val">${feelsLike}°</span></div>
                            <div class="rich-data-item"><span class="rich-label">Dew Point</span><span class="rich-val">--</span></div>
                        </div>
                    `;
                    break;
                case 'aqi':
                    title = "Air Quality"; icon = "fas fa-leaf";
                    val = document.getElementById('aqi-val').textContent; unit = document.getElementById('aqi-desc').textContent;
                    const aqData = window._currentMetrics.aq.list[0].components;
                    desc = `
                        <p>${window._metricsDesc?.aqi || "Data unavailable"}</p>
                        <div class="modal-rich-data" style="grid-template-columns: repeat(2, 1fr);">
                            <div class="rich-data-item"><span class="rich-label">PM2.5</span><span class="rich-val">${aqData.pm2_5}</span></div>
                            <div class="rich-data-item"><span class="rich-label">PM10</span><span class="rich-val">${aqData.pm10}</span></div>
                            <div class="rich-data-item"><span class="rich-label">CO</span><span class="rich-val">${aqData.co}</span></div>
                            <div class="rich-data-item"><span class="rich-label">NO2</span><span class="rich-val">${aqData.no2}</span></div>
                        </div>
                    `;
                    break;
                case 'pressure':
                    title = "Pressure"; icon = "fas fa-tachometer-alt";
                    val = document.getElementById('pressure-val').textContent; unit = "hPa";
                    const sea = window._currentMetrics.current.main.sea_level;
                    const grnd = window._currentMetrics.current.main.grnd_level;
                    desc = `
                        <p>${window._metricsDesc?.pressure || "Data unavailable"}</p>
                        <div class="modal-rich-data">
                            <div class="rich-data-item"><span class="rich-label">Sea Level</span><span class="rich-val">${sea ? sea + ' hPa' : '--'}</span></div>
                            <div class="rich-data-item"><span class="rich-label">Ground Level</span><span class="rich-val">${grnd ? grnd + ' hPa' : '--'}</span></div>
                        </div>
                    `;
                    break;
                case 'sun':
                    title = "Sun Tracker"; icon = "fas fa-sun";
                    val = document.getElementById('sunset-time').textContent; unit = "Sunset";
                    desc = `
                        <p>${window._metricsDesc?.sun || "Data unavailable"}</p>
                        <div class="modal-rich-data">
                            <div class="rich-data-item"><span class="rich-label">Sunrise</span><span class="rich-val">${document.getElementById('sunrise-time').textContent}</span></div>
                            <div class="rich-data-item"><span class="rich-label">Sunset</span><span class="rich-val">${document.getElementById('sunset-time').textContent}</span></div>
                        </div>
                    `;
                    break;
                case 'visibility':
                    title = "Visibility"; icon = "far fa-eye";
                    val = document.getElementById('visibility-val').textContent; unit = "km";
                    const clouds = window._currentMetrics.current.clouds.all;
                    desc = `
                        <p>${window._metricsDesc?.visibility || "Data unavailable"}</p>
                        <div class="modal-rich-data">
                            <div class="rich-data-item"><span class="rich-label">Cloudiness</span><span class="rich-val">${clouds}%</span></div>
                        </div>
                    `;
                    break;
            }
            
            document.getElementById('modal-title').textContent = title;
            document.getElementById('modal-icon').className = icon;
            document.getElementById('modal-value').textContent = val;
            document.getElementById('modal-unit').textContent = unit;
            document.getElementById('modal-desc').innerHTML = desc;
            
            modal.classList.remove('hidden');
        });
    });
});

// ==========================================
// API LOGIC
// ==========================================
async function handleSearch() {
    const city = DOM.input.value.trim();
    if (!city) return;
    DOM.input.blur();
    await fetchWeatherData(city);
}

async function fetchWeatherData(city) {
    // UI State: Loading
    DOM.main.classList.add('hidden');
    DOM.error.classList.add('hidden');
    DOM.loading.classList.remove('hidden');

    try {
        const response = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Atmospheric anomaly detected. City not found.');
        }

        renderWeather(data);
        
        // UI State: Success
        DOM.loading.classList.add('hidden');
        DOM.main.classList.remove('hidden');
        DOM.main.classList.add('fade-in');
        
        // Re-trigger fade-in animation safely
        DOM.main.classList.remove('fade-in');
        void DOM.main.offsetWidth; // Trigger reflow
        DOM.main.classList.add('fade-in');

    } catch (err) {
        console.error(err);
        DOM.loading.classList.add('hidden');
        DOM.errorText.textContent = err.message;
        DOM.error.classList.remove('hidden');
    }
}

async function fetchWeatherDataByCoords(lat, lon) {
    // UI State: Loading
    DOM.main.classList.add('hidden');
    DOM.error.classList.add('hidden');
    DOM.loading.classList.remove('hidden');

    try {
        const response = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Atmospheric anomaly detected. Location not found.');
        }

        renderWeather(data);
        
        // UI State: Success
        DOM.loading.classList.add('hidden');
        DOM.main.classList.remove('hidden');
        
        // Re-trigger fade-in animation safely
        DOM.main.classList.remove('fade-in');
        void DOM.main.offsetWidth; // Trigger reflow
        DOM.main.classList.add('fade-in');

    } catch (err) {
        console.error(err);
        DOM.loading.classList.add('hidden');
        DOM.errorText.textContent = err.message;
        DOM.error.classList.remove('hidden');
    }
}

// ==========================================
// RENDERING LOGIC
// ==========================================
function renderWeather(data) {
    const { current, forecast, airQuality, locationInfo } = data;
    
    updateTheme(current.weather[0].id, current.weather[0].icon);
    renderLocationBadge(locationInfo, current);
    renderHero(current);
    renderHourly(forecast);
    renderDaily(forecast);
    renderDetails(current, airQuality);
}

function renderLocationBadge(locationInfo, current) {
    const badge = document.getElementById('location-badge');
    if (!locationInfo) {
        badge.classList.add('hidden');
        return;
    }
    
    document.getElementById('loc-city').textContent = locationInfo.name || current.name;
    
    let countryName = locationInfo.country;
    try {
        countryName = new Intl.DisplayNames(['en'], { type: 'region' }).of(locationInfo.country) || locationInfo.country;
    } catch(e) {}
    
    if (locationInfo.state) {
        document.getElementById('loc-state').textContent = `${locationInfo.state}, ${countryName}`;
    } else {
        document.getElementById('loc-state').textContent = countryName;
    }
    
    badge.classList.remove('hidden');
}

function renderHero(current) {
    document.getElementById('city-name').textContent = `${current.name}, ${current.sys.country}`;
    
    const dateOpts = { weekday: 'long', month: 'short', day: 'numeric' };
    document.getElementById('date-time').textContent = new Date().toLocaleDateString('en-US', dateOpts);
    
    document.getElementById('weather-condition').textContent = current.weather[0].description;
    document.getElementById('weather-phrase').textContent = getWeatherPhrase(current.weather[0].id);
    document.getElementById('feels-like').textContent = `Feels like ${Math.round(current.main.feels_like)}°`;
    
    const iconCode = current.weather[0].icon;
    document.getElementById('weather-emoji').textContent = getWeatherEmoji(current.weather[0].id, iconCode.includes('n'));

    animateValue('temperature', 0, Math.round(current.main.temp), 1500);
}

function renderHourly(forecast) {
    const container = document.getElementById('hourly-container');
    container.innerHTML = '';
    
    // Take next 8 items (24 hours)
    const next24 = forecast.list.slice(0, 8);
    
    next24.forEach(item => {
        const time = new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const temp = Math.round(item.main.temp);
        const icon = item.weather[0].icon;
        const emoji = getWeatherEmoji(item.weather[0].id, icon.includes('n'));
        const card = document.createElement('div');
        card.className = 'hour-card';
        card.innerHTML = `
            <p class="hour-time">${time}</p>
            <div class="hour-emoji">${emoji}</div>
            <p class="hour-temp">${temp}°</p>
        `;
        container.appendChild(card);
    });
}

function renderDaily(forecast) {
    const list = document.getElementById('forecast-list');
    list.innerHTML = '';

    // Group by day
    const days = {};
    forecast.list.forEach(item => {
        const date = new Date(item.dt * 1000).toLocaleDateString();
        if (!days[date]) days[date] = { min: item.main.temp_min, max: item.main.temp_max, icon: item.weather[0].icon, id: item.weather[0].id, dt: item.dt };
        else {
            days[date].min = Math.min(days[date].min, item.main.temp_min);
            days[date].max = Math.max(days[date].max, item.main.temp_max);
        }
    });

    const dayKeys = Object.keys(days).slice(0, 5); // 5 days
    dayKeys.forEach(key => {
        const day = days[key];
        const dayName = new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' });
        const emoji = getWeatherEmoji(day.id, false); // Days generally use daytime emoji
        
        const el = document.createElement('div');
        el.className = 'day-item';
        el.innerHTML = `
            <span class="day-name">${dayName}</span>
            <span class="day-emoji">${emoji}</span>
            <div class="day-temps">
                <span class="temp-high">${Math.round(day.max)}°</span>
                <span class="temp-low">${Math.round(day.min)}°</span>
            </div>
        `;
        list.appendChild(el);
    });
}

function renderDetails(current, aq) {
    window._metricsDesc = {};
    window._currentMetrics = { current, aq };

    // Wind
    const windSpeed = Math.round(current.wind.speed * 3.6);
    animateValue('wind-speed', 0, windSpeed, 1000);
    const arrow = document.querySelector('#wind-compass .arrow');
    arrow.style.transform = `rotate(${current.wind.deg}deg)`;
    window._metricsDesc.wind = getWindDesc(windSpeed);

    // Humidity
    const humidity = current.main.humidity;
    animateValue('humidity-val', 0, humidity, 1000);
    const ring = document.getElementById('humidity-ring');
    const circumference = 251.2;
    const offset = circumference - (humidity / 100) * circumference;
    setTimeout(() => { ring.style.strokeDashoffset = offset; }, 100);
    window._metricsDesc.humidity = getHumDesc(humidity);

    // Pressure & Visibility
    animateValue('pressure-val', 0, current.main.pressure, 1500);
    window._metricsDesc.pressure = getPressDesc(current.main.pressure);
    
    const visKm = Math.round(current.visibility / 1000);
    animateValue('visibility-val', 0, visKm, 1000);
    window._metricsDesc.visibility = getVisDesc(visKm);

    // Air Quality (US EPA AQI from PM2.5)
    const pm25 = aq.list[0].components.pm2_5 || 0;
    const usAqi = calcAQI(pm25);
    let aqiText = "";
    if (usAqi <= 50) aqiText = "Good";
    else if (usAqi <= 100) aqiText = "Satisfactory";
    else if (usAqi <= 150) aqiText = "Moderate";
    else if (usAqi <= 200) aqiText = "Poor";
    else if (usAqi <= 300) aqiText = "Very Poor";
    else aqiText = "Severe";

    document.getElementById('aqi-val').textContent = usAqi;
    document.getElementById('aqi-desc').textContent = aqiText;
    
    // Percentage for the bar (cap at 300 for UI purposes)
    const aqiPercent = Math.min((usAqi / 300) * 100, 100);
    setTimeout(() => { document.getElementById('aqi-progress').style.left = `calc(${aqiPercent}% - 14px)`; }, 100);
    
    document.getElementById('aqi-text-desc').textContent = `Air quality index is ${usAqi}, which is considered ${aqiText.toLowerCase()}.`;
    window._metricsDesc.aqi = `Air quality index is ${usAqi}, which is considered ${aqiText.toLowerCase()}.`;

    // Poetic Weather Insight
    document.getElementById('poetic-text').innerHTML = getPoeticWeather(current.weather[0].id);

    // Sun Tracker (Simplified Arc)
    const now = Math.floor(Date.now() / 1000);
    const sr = current.sys.sunrise;
    const ss = current.sys.sunset;
    
    document.getElementById('sunrise-time').textContent = new Date(sr * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    document.getElementById('sunset-time').textContent = new Date(ss * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let sunPercent = 0;
    if (now > sr && now < ss) {
        sunPercent = (now - sr) / (ss - sr);
    } else if (now >= ss) {
        sunPercent = 1;
    }

    const sunArc = document.getElementById('sun-arc-progress');
    const sunDot = document.getElementById('sun-dot');
    
    // Math for SVG Arc (Radius 80, Center 100, 90)
    const totalLength = 251.3; // Approx length of semi-circle r=80
    setTimeout(() => { 
        sunArc.style.strokeDashoffset = totalLength - (sunPercent * totalLength); 
        
        // Calculate dot position based on angle (180 deg to 0 deg)
        // Pi radians to 0 radians
        const angle = Math.PI - (sunPercent * Math.PI);
        const cx = 100 + 80 * Math.cos(angle);
        const cy = 90 - 80 * Math.sin(angle);
        sunDot.setAttribute('cx', cx);
        sunDot.setAttribute('cy', cy);
    }, 100);

    if (now < sr) {
        window._metricsDesc.sun = "Waiting for sunrise.";
    } else if (now > ss) {
        window._metricsDesc.sun = "Sun has set.";
    } else {
        window._metricsDesc.sun = "Enjoy the daylight.";
    }
}

function getWeatherEmoji(id, isNight = false) {
    if (id >= 200 && id < 300) return "⛈️"; // Thunderstorm
    if (id >= 300 && id < 500) return "🌦️"; // Drizzle
    if (id >= 500 && id < 600) return "🌧️"; // Rain
    if (id >= 600 && id < 700) return "❄️"; // Snow
    if (id >= 700 && id < 800) return "🌫️"; // Atmosphere
    if (id === 800) return isNight ? "🌙" : "☀️"; // Clear
    if (id === 801) return isNight ? "☁️" : "⛅"; // Few clouds
    if (id > 801) return "☁️"; // Clouds
    return "🌡️";
}

function getWeatherPhrase(id) {
    if (id >= 200 && id < 300) return "Expect severe weather and lightning.";
    if (id >= 300 && id < 600) return "Keep an umbrella handy today.";
    if (id >= 600 && id < 700) return "Bundle up, it's freezing out there.";
    if (id >= 700 && id < 800) return "Drive carefully, visibility may be low.";
    if (id === 800) return "Perfect conditions to go outside.";
    return "A typical cloudy day. Expect a gloomy sky.";
}

function getWindDesc(speed) {
    if (speed < 10) return "Calm and gentle breeze.";
    if (speed < 25) return "Noticeable wind, quite breezy.";
    return "Strong winds, hold onto your hat!";
}

function getHumDesc(hum) {
    if (hum < 30) return "Dry conditions.";
    if (hum < 60) return "Comfortable and pleasant.";
    return "Feeling muggy and humid.";
}

function getPressDesc(press) {
    if (press < 1000) return "Low pressure system.";
    if (press < 1020) return "Stable atmospheric pressure.";
    return "High pressure system.";
}

function getVisDesc(vis) {
    if (vis < 2) return "Dangerously low visibility.";
    if (vis < 5) return "Hazy view.";
    return "Perfectly clear view.";
}

function getAqiDesc(aqi) {
    if (aqi === 1) return "Air quality is ideal for outdoor activities.";
    if (aqi <= 3) return "Acceptable air quality for most people.";
    return "Consider staying indoors today.";
}

function calcAQI(pm25) {
    const bp = [
        [0.0, 12.0, 0, 50],
        [12.1, 35.4, 51, 100],
        [35.5, 55.4, 101, 150],
        [55.5, 150.4, 151, 200],
        [150.5, 250.4, 201, 300],
        [250.5, 500.4, 301, 500]
    ];
    for (let i = 0; i < bp.length; i++) {
        let [cLow, cHigh, iLow, iHigh] = bp[i];
        if (pm25 >= cLow && pm25 <= cHigh) {
            return Math.round(((iHigh - iLow) / (cHigh - cLow)) * (pm25 - cLow) + iLow);
        }
    }
    return pm25 > 500.4 ? 500 : 0;
}

function getPoeticWeather(id) {
    if (id >= 200 && id < 300) return `"The sky grew darker, painted with stroke after stroke of black and purple."`;
    if (id >= 300 && id < 500) return `"A light drizzle kisses the earth, whispering secrets to the leaves."`;
    if (id >= 500 && id < 600) return `"The rain began to fall, like a gentle melody from the heavens."`;
    if (id >= 600 && id < 700) return `"Snowflakes danced in the cold air, turning the world into a quiet, white dream."`;
    if (id >= 700 && id < 800) return `"A misty veil draped over the landscape, hiding the world in soft grey mystery."`;
    if (id === 800) return `"The sun poured its golden honey over the awakened earth."`;
    if (id === 801) return `"A few clouds wandered lazily across the vast blue canvas."`;
    return `"The sky was a thick blanket of grey, waiting patiently for the sun's return."`;
}

// ==========================================
// UTILITIES & EFFECTS
// ==========================================
function updateTheme(weatherId, iconCode) {
    const root = document.documentElement;
    const isNight = iconCode.includes('n');

    if (isNight) {
        // Night Theme
        root.style.setProperty('--theme-1', '#142C4D'); // Night Blue
        root.style.setProperty('--theme-2', '#7C6CFF'); // Aurora Purple
        root.style.setProperty('--theme-3', '#9D8BFF'); // Lavender Glow
        root.style.setProperty('--theme-shadow', 'rgba(124, 108, 255, 0.2)');
        return;
    }

    // OpenWeatherMap ID ranges
    if (weatherId >= 200 && weatherId < 300) { // Thunderstorm
        root.style.setProperty('--theme-1', '#08111F'); // Midnight Navy
        root.style.setProperty('--theme-2', '#675BFF'); // Electric Violet
        root.style.setProperty('--theme-3', '#7C6CFF'); // Aurora Purple
        root.style.setProperty('--theme-shadow', 'rgba(103, 91, 255, 0.2)');
    } else if (weatherId >= 300 && weatherId < 600) { // Rain/Drizzle
        root.style.setProperty('--theme-1', '#102E46'); // Deep Ocean
        root.style.setProperty('--theme-2', '#3DD9FF'); // Electric Cyan
        root.style.setProperty('--theme-3', '#6FCFFF'); // Sky Glow
        root.style.setProperty('--theme-shadow', 'rgba(61, 217, 255, 0.15)');
    } else if (weatherId >= 600 && weatherId < 700) { // Snow
        root.style.setProperty('--theme-1', '#73E8FF'); // Ice Blue
        root.style.setProperty('--theme-2', '#9EEBFF'); // Crystal Blue
        root.style.setProperty('--theme-3', '#FAFAFA'); // White
        root.style.setProperty('--theme-shadow', 'rgba(115, 232, 255, 0.15)');
    } else if (weatherId >= 700 && weatherId < 800) { // Atmosphere (Fog/Mist)
        root.style.setProperty('--theme-1', '#64748B'); // Disabled/Grey
        root.style.setProperty('--theme-2', '#8EA4B7'); // Muted
        root.style.setProperty('--theme-3', '#C6D5E3'); // Secondary text
        root.style.setProperty('--theme-shadow', 'rgba(142, 164, 183, 0.15)');
    } else if (weatherId === 800) { // Clear (Sunny)
        root.style.setProperty('--theme-1', '#FFD56B'); // Golden Sun
        root.style.setProperty('--theme-2', '#FFB84D'); // Warm Orange
        root.style.setProperty('--theme-3', '#FF8C7A'); // Sunset Coral
        root.style.setProperty('--theme-shadow', 'rgba(255, 213, 107, 0.15)');
    } else { // Clouds
        root.style.setProperty('--theme-1', '#8EA4B7'); // Muted Grey
        root.style.setProperty('--theme-2', '#64748B'); // Disabled Grey
        root.style.setProperty('--theme-3', '#C6D5E3'); // Silver
        root.style.setProperty('--theme-shadow', 'rgba(142, 164, 183, 0.1)');
    }
}

function animateValue(id, start, end, duration) {
    if (start === end) return;
    const obj = document.getElementById(id);
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        // easeOutQuart
        const ease = 1 - Math.pow(1 - progress, 4);
        const current = Math.floor(ease * (end - start) + start);
        obj.innerHTML = current;
        if (progress < 1) {
            window.requestAnimationFrame(step);
        } else {
            obj.innerHTML = end;
        }
    };
    window.requestAnimationFrame(step);
}
