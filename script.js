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
    
    modalClose.addEventListener('click', closeModal);
    
    modal.addEventListener('click', (e) => {
        if(e.target === modal) closeModal();
    });

    // ==========================================
    // PREMIUM MOTION - GLOBAL PARALLAX
    // ==========================================
    document.addEventListener('mousemove', (e) => {
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;
        
        // Global Parallax Rotation (-2deg to 2deg)
        const rotateX = (y - 0.5) * -4; 
        const rotateY = (x - 0.5) * 4;
        
        const appWrapper = document.querySelector('.app-wrapper');
        if(appWrapper) {
            requestAnimationFrame(() => {
                appWrapper.style.transform = `perspective(2000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            });
        }
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

    const placeholders = ["Search city...", "Try 'Tokyo'...", "Try 'New York'...", "Try 'London'..."];
    let placeholderIdx = 0;
    setInterval(() => {
        placeholderIdx = (placeholderIdx + 1) % placeholders.length;
        DOM.input.setAttribute('placeholder', placeholders[placeholderIdx]);
    }, 3000);

    // Cmd+K to focus search
    document.addEventListener('keydown', (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            DOM.input.focus();
        }
    });

    // ==========================================
    // INITIALIZATION
    // ==========================================
async function handleSearch() {
    const city = DOM.input.value.trim();
    if (!city) return;
    DOM.input.blur();
    await fetchWeatherData(city);
}

async function fetchWeatherData(city) {
    DOM.error.classList.add('hidden');
    
    // Smooth exit
    DOM.main.classList.add('view-transition-exit');

    try {
        // Fetch and wait for CSS exit transition to finish concurrently
        const [response] = await Promise.all([
            fetch(`/api/weather?city=${encodeURIComponent(city)}`),
            new Promise(r => setTimeout(r, 400))
        ]);
        
        const data = await response.json();

        if (!response.ok) {
            throw new Error('City Not Found');
        }

        // Prepare enter state
        DOM.main.classList.remove('view-transition-exit');
        DOM.main.classList.add('view-transition-enter');
        DOM.main.classList.remove('hidden'); // Ensure it's not display: none
        DOM.loading.classList.add('hidden'); // Hide loader if it was there
        
        renderWeather(data);
        
        // Trigger reflow and transition in
        void DOM.main.offsetWidth;
        DOM.main.classList.remove('view-transition-enter');

    } catch (err) {
        console.error(err);
        DOM.main.classList.add('hidden');
        DOM.main.classList.remove('view-transition-exit');
        DOM.loading.classList.add('hidden');
        DOM.errorText.textContent = err.message;
        DOM.error.classList.remove('hidden');
    }
}

async function fetchWeatherDataByCoords(lat, lon) {
    DOM.error.classList.add('hidden');
    
    // Smooth exit
    DOM.main.classList.add('view-transition-exit');

    try {
        const [response] = await Promise.all([
            fetch(`/api/weather?lat=${lat}&lon=${lon}`),
            new Promise(r => setTimeout(r, 400))
        ]);
        
        const data = await response.json();

        if (!response.ok) {
            throw new Error('City Not Found');
        }

        // Pin the location badge to the user's actual GPS location permanently
        renderLocationBadge(data.locationInfo, data.current);
        
        // Prepare enter state
        DOM.main.classList.remove('view-transition-exit');
        DOM.main.classList.add('view-transition-enter');
        DOM.main.classList.remove('hidden');
        DOM.loading.classList.add('hidden');
        
        renderWeather(data);
        
        // Trigger reflow and transition in
        void DOM.main.offsetWidth;
        DOM.main.classList.remove('view-transition-enter');

    } catch (err) {
        console.error(err);
        DOM.main.classList.add('hidden');
        DOM.main.classList.remove('view-transition-exit');
        DOM.loading.classList.add('hidden');
        DOM.errorText.textContent = err.message;
        DOM.error.classList.remove('hidden');
    }
}

// ==========================================
// RENDERING LOGIC
// ==========================================
function renderWeather(data) {
    const { current, forecast, airQuality } = data;
    
    // Update WebGL Globe Camera
    if (window.myGlobe && current.coord) {
        window.myGlobe.pointOfView({ lat: current.coord.lat, lng: current.coord.lon, altitude: 1.5 }, 2000);
        window.myGlobe.pointsData([{ lat: current.coord.lat, lng: current.coord.lon, label: current.name }]);
    }

    updateTheme(current);
    // Location badge is explicitly not updated here to keep the user's GPS location pinned
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
    
    const now = new Date(current.dt * 1000);
    const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    document.getElementById('date-time').textContent = dateStr;
    
    animateValue('temperature', 0, Math.round(current.main.temp), 1500);
    document.getElementById('weather-condition').textContent = current.weather[0].description;
    
    const story = generateWeatherStory(Math.round(current.main.temp), current.weather[0].id, current.wind.speed);
    document.getElementById('feels-like').textContent = story;
    document.getElementById('weather-phrase').style.display = 'none';
    
    const iconCode = current.weather[0].icon;
    document.getElementById('hero-icon-wrapper').innerHTML = `
        <div class="hero-emoji">${getWeatherEmoji(current.weather[0].id, iconCode.includes('n'))}</div>
        <div class="icon-glow"></div>
    `;
}

function generateWeatherStory(temp, conditionId, windSpeed) {
    let tempStory = "";
    if (temp < 0) tempStory = "Freezing temperatures.";
    else if (temp < 10) tempStory = "A cold, crisp atmosphere.";
    else if (temp < 20) tempStory = "A cool and refreshing breeze.";
    else if (temp < 30) tempStory = "Comfortably warm conditions.";
    else tempStory = "Intense, radiating heat.";

    let condStory = "";
    if (conditionId >= 200 && conditionId < 300) condStory = "Stay inside, a heavy storm is rolling through.";
    else if (conditionId >= 300 && conditionId < 500) condStory = "Light drizzles are tracing the glass.";
    else if (conditionId >= 500 && conditionId < 600) condStory = "Steady rain washes the streets.";
    else if (conditionId >= 600 && conditionId < 700) condStory = "Snowflakes are settling quietly.";
    else if (conditionId >= 700 && conditionId < 800) condStory = "A thick atmospheric haze obscures the distance.";
    else if (conditionId === 800) condStory = "Perfectly clear skies stretching endlessly.";
    else if (conditionId === 801 || conditionId === 802) condStory = "A few clouds lazily drifting by.";
    else condStory = "A heavy blanket of clouds overhead.";
    
    let windStory = "";
    if (windSpeed > 20) windStory = " with strong, disruptive gusts.";
    else if (windSpeed > 10) windStory = " with a noticeable breeze.";
    else windStory = ".";

    return `${tempStory} ${condStory.replace('.', '')}${windStory}`;
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
    const windSpeed = Math.round((current.wind.speed * 3600) / 1000); // m/s to km/h
    animateValue('wind-speed', 0, windSpeed, 1000);
    const arrow = document.querySelector('#wind-compass .arrow');
    arrow.style.transform = `rotate(${current.wind.deg}deg)`;
    window._metricsDesc.wind = getWindDesc(windSpeed);
    
    // Wind Trend
    const windTrendText = windSpeed > 20 ? "↗ Strong Winds" : "↘ Calm";
    document.getElementById('wind-trend').textContent = windTrendText;

    // Humidity
    const humidity = current.main.humidity;
    animateValue('humidity-val', 0, humidity, 1000);
    const ring = document.getElementById('humidity-ring');
    const circumference = 251.2;
    const offset = circumference - (humidity / 100) * circumference;
    setTimeout(() => { ring.style.strokeDashoffset = offset; }, 100);
    window._metricsDesc.humidity = getHumDesc(humidity);

    // Pressure
    const pressureVal = current.main.pressure;
    animateValue('pressure-val', 0, pressureVal, 1500);
    window._metricsDesc.pressure = getPressDesc(pressureVal);
    
    // Pressure Trend
    let pressTrend = "Normal";
    if (pressureVal > 1013) pressTrend = "↗ High Pressure";
    else if (pressureVal < 1013) pressTrend = "↘ Low Pressure";
    document.getElementById('pressure-trend').textContent = pressTrend;
    
    // Visibility
    const visKm = Math.round(current.visibility / 1000);
    animateValue('visibility-val', 0, visKm, 1000);
    window._metricsDesc.visibility = getVisDesc(visKm);
    
    // Visibility Ring & Trend
    const visRing = document.getElementById('vis-ring');
    const visPercent = Math.min((visKm / 10) * 100, 100);
    const visOffset = circumference - (visPercent / 100) * circumference;
    setTimeout(() => { visRing.style.strokeDashoffset = visOffset; }, 100);
    
    let visTrend = "Perfectly clear";
    if (visKm < 2) visTrend = "Dangerously low";
    else if (visKm < 5) visTrend = "Slightly hazy";
    document.getElementById('vis-trend').textContent = visTrend;

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
    document.getElementById('poetic-text').innerHTML = getNarrativeText(current);

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

function getNarrativeText(current) {
    const id = current.weather[0].id;
    const now = Math.floor(Date.now() / 1000);
    const isNight = now < current.sys.sunrise || now > current.sys.sunset;
    const windSpeed = Math.round((current.wind.speed * 3600) / 1000); // km/h

    if (id >= 200 && id < 300) return `"I'd highly recommend staying indoors and keeping warm; there's a storm out there."`;
    if (id >= 300 && id < 500) return `"You might want to grab a warm drink—it's the perfect weather for a cozy morning coffee."`;
    if (id >= 500 && id < 600) return `"Make sure you carry an umbrella this ${isNight ? 'evening' : 'afternoon'}, you're going to need it."`;
    if (id >= 600 && id < 700) return `"Bundle up if you're heading out, and please drive carefully in the snow!"`;
    if (id >= 700 && id < 800) return `"I'd suggest taking it slow on the roads today; visibility is quite low due to the mist."`;
    
    if (id === 800) {
        if (isNight) return `"You should definitely look up tonight—it's an ideal time for stargazing."`;
        if (windSpeed > 15) return `"It's a beautiful, breezy day out there. I'd suggest planning some outdoor activities!"`;
        return `"It's absolutely perfect outside. You should take a moment for a refreshing walk."`;
    }
    
    if (id === 801 || id === 802) return `"It's a really well-balanced, beautiful day. Perfect for leaving the windows open."`;
    
    return `"It's a quiet, overcast day. I'd suggest putting on some good music and relaxing."`;
}

// ==========================================
// UTILITIES & EFFECTS
// ==========================================
function updateTheme(current) {
    const root = document.documentElement;
    const id = current.weather[0].id;
    const now = current.dt;
    const sunrise = current.sys.sunrise;
    const sunset = current.sys.sunset;
    
    // Time of Day Logic
    let timeOfDay = 'afternoon';
    const hourMs = 3600;
    
    if (now < sunrise - hourMs || now > sunset + hourMs) {
        timeOfDay = 'night';
    } else if (now >= sunrise - hourMs && now <= sunrise + hourMs * 2) {
        timeOfDay = 'morning';
    } else if (now >= sunset - hourMs && now <= sunset + hourMs) {
        timeOfDay = 'sunset';
    } else {
        timeOfDay = 'afternoon';
    }

    // Base colors based on condition
    let t1, t2, t3;
    let bgBase, bgDeep, surface1, textMain, glassHighlight;
    let cloudOpacity = 0.4;
    let fogOpacity = 0;
    if (timeOfDay === 'morning') {
        bgBase = '#5582a8'; bgDeep = '#2c4a6b'; surface1 = 'rgba(255,255,255,0.1)'; 
        textMain = '#F0F4F8'; glassHighlight = 'rgba(255,255,255,0.2)';
        t1 = '#FFB26B'; t2 = '#FFD56F'; t3 = '#FAEDCD'; 
        cloudOpacity = 0.4; fogOpacity = 0.1;
    } else if (timeOfDay === 'sunset') {
        bgBase = '#ab5b49'; bgDeep = '#4a2520'; surface1 = 'rgba(255,255,255,0.1)'; 
        textMain = '#FFF4EB'; glassHighlight = 'rgba(255,255,255,0.2)';
        t1 = '#FF7B54'; t2 = '#FFB26B'; t3 = '#FFD56F'; 
        cloudOpacity = 0.6; fogOpacity = 0;
    } else if (timeOfDay === 'night') {
        bgBase = '#13284A'; bgDeep = '#071126'; surface1 = 'rgba(26, 28, 41, 0.4)'; 
        textMain = '#E0E2EB'; glassHighlight = 'rgba(255, 255, 255, 0.05)';
        t1 = '#4A6984'; t2 = '#7A9E9F'; t3 = '#B8D8D8'; 
        cloudOpacity = 0.1; fogOpacity = 0.2;
    } else {
        // Afternoon
        bgBase = '#74add4'; bgDeep = '#437ba3'; surface1 = 'rgba(255,255,255,0.1)'; 
        textMain = '#ffffff'; glassHighlight = 'rgba(255, 255, 255, 0.22)';
        t1 = '#FFD56F'; t2 = '#FAEDCD'; t3 = '#ffffff'; 
        cloudOpacity = 0.3; fogOpacity = 0;
    }

    // Override themes for severe weather (Weather Theme Engine)
    document.body.className = ''; // reset classes
    if (id >= 200 && id < 600) { // Rain/Thunderstorm
        bgBase = '#1B2631'; bgDeep = '#0c1218'; surface1 = 'rgba(0,0,0,0.3)';
        t1 = '#4A6984'; t2 = '#7A9E9F'; t3 = '#B8D8D8'; 
        cloudOpacity = 0.8; fogOpacity = 0.4;
        document.body.classList.add(id >= 200 && id < 300 ? 'theme-storm' : 'theme-rain');
    } else if (id >= 600 && id < 700) { // Snow
        bgBase = '#556d82'; bgDeep = '#34495E'; surface1 = 'rgba(255,255,255,0.2)';
        t1 = '#8CA8C6'; t2 = '#C2D3E4'; t3 = '#E6EEF5'; 
        cloudOpacity = 0.9; fogOpacity = 0.5;
        document.body.classList.add('theme-snow');
    } else if (id >= 700 && id < 800) { // Fog/Mist
        cloudOpacity = 0; fogOpacity = 0.8;
        document.body.classList.add('theme-fog');
    } else if (id === 800) {
        document.body.classList.add('theme-sunny');
    }

    root.style.setProperty('--bg-base', bgBase);
    root.style.setProperty('--bg-deep', bgDeep);
    root.style.setProperty('--surface-1', surface1);
    root.style.setProperty('--text-main', textMain);
    root.style.setProperty('--glass-highlight', glassHighlight);
    root.style.setProperty('--cloud-opacity', cloudOpacity);
    root.style.setProperty('--fog-opacity', fogOpacity);
    
    root.style.setProperty('--theme-1', t1);
    root.style.setProperty('--theme-2', t2);
    root.style.setProperty('--theme-3', t3);
    root.style.setProperty('--theme-shadow', t1 + '40');
    
    // Celestial Tracker Logic
    const celestial = document.getElementById('celestial-body');
    if (celestial) {
        let percentage = 0;
        let isSun = true;
        
        if (now >= sunrise && now <= sunset) {
            // Day time arc
            percentage = (now - sunrise) / (sunset - sunrise);
            celestial.style.background = 'radial-gradient(circle, #FFD56B 0%, #FF8C7A 100%)';
            celestial.style.boxShadow = '0 0 100px #FFD56B';
            celestial.style.opacity = '0.8';
        } else {
            // Night time arc
            isSun = false;
            let start = sunset;
            let end = sunrise + (24 * hourMs); // tomorrow's sunrise approx
            if (now < sunrise) {
                start = sunset - (24 * hourMs); // yesterday's sunset approx
                end = sunrise;
            }
            percentage = (now - start) / (end - start);
            celestial.style.background = 'radial-gradient(circle, #E6EEF5 0%, #8CA8C6 100%)';
            celestial.style.boxShadow = '0 0 80px #E6EEF5';
            celestial.style.opacity = '0.4';
        }
        
        // Clamp percentage 0-1
        percentage = Math.max(0, Math.min(1, percentage));
        
        // Arc math (Parabola)
        const xPos = (percentage * 120) - 10; // -10% to 110%
        const yPos = 100 - (Math.sin(percentage * Math.PI) * 120); 
        
        celestial.style.left = `${xPos}%`;
        celestial.style.top = `${yPos}%`;
        celestial.style.transform = `translate(-50%, -50%)`;
    }
    
    // Render Atmospheric Particles
    renderParticles(id, timeOfDay);
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

function renderParticles(id, timeOfDay) {
    const container = document.getElementById('particle-container');
    if (!container) return;
    
    // Clear previous particles
    container.innerHTML = '';
    
    // Night: Stars
    if (timeOfDay === 'night' && id >= 800) {
        for(let i=0; i<60; i++) {
            const star = document.createElement('div');
            star.className = 'star-particle';
            star.style.left = `${Math.random() * 100}vw`;
            star.style.top = `${Math.random() * 100}vh`;
            star.style.width = `${Math.random() * 3}px`;
            star.style.height = star.style.width;
            star.style.animationDuration = `${2 + Math.random() * 3}s`;
            star.style.animationDelay = `${Math.random() * 2}s`;
            container.appendChild(star);
        }
    }

    // Sunny/Clear Day: Lens Flare & Warm Bloom
    if (id === 800 && timeOfDay !== 'night') {
        const flare = document.createElement('div');
        flare.className = 'lens-flare';
        container.appendChild(flare);
        
        for(let i=0; i<30; i++) {
            const p = document.createElement('div');
            p.className = 'dust-particle';
            p.style.left = `${Math.random() * 100}vw`;
            p.style.top = `${Math.random() * 100}vh`;
            p.style.animationDuration = `${10 + Math.random() * 20}s`;
            p.style.animationDelay = `${Math.random() * 5}s`;
            container.appendChild(p);
        }
    }
    // Rain/Thunderstorm/Drizzle
    else if (id >= 200 && id < 600 && id !== 211 && id !== 212 && id !== 221) { 
        // Slanted drops
        for(let i=0; i<120; i++) {
            const drop = document.createElement('div');
            drop.className = 'rain-drop';
            drop.style.left = `${Math.random() * 120 - 10}vw`; // wider to account for slant
            drop.style.animationDuration = `${0.3 + Math.random() * 0.4}s`;
            drop.style.animationDelay = `${Math.random() * 2}s`;
            container.appendChild(drop);
        }
        // Small ripples to simulate hitting glass
        for(let i=0; i<25; i++) {
            const ripple = document.createElement('div');
            ripple.className = 'rain-ripple';
            ripple.style.left = `${Math.random() * 100}vw`;
            ripple.style.top = `${Math.random() * 100}vh`;
            ripple.style.width = `${20 + Math.random() * 30}px`;
            ripple.style.height = ripple.style.width;
            ripple.style.animationDuration = `${1 + Math.random() * 2}s`;
            ripple.style.animationDelay = `${Math.random() * 2}s`;
            container.appendChild(ripple);
        }
        if(id >= 200 && id < 300) { // Thunderstorm
            const flash = document.createElement('div');
            flash.className = 'lightning-flash';
            container.appendChild(flash);
        }
    }
    // Snow
    else if (id >= 600 && id < 700) {
        for(let i=0; i<100; i++) {
            const flake = document.createElement('div');
            flake.className = 'snow-flake';
            flake.style.left = `${Math.random() * 100}vw`;
            flake.style.animationDuration = `${5 + Math.random() * 8}s`;
            flake.style.animationDelay = `${Math.random() * 5}s`;
            flake.style.opacity = Math.random() * 0.8 + 0.2;
            flake.style.width = `${Math.random() * 6 + 2}px`;
            flake.style.height = flake.style.width;
            container.appendChild(flake);
        }
    }
    // Fog / Mist
    else if (id >= 700 && id < 800) {
        for(let i=0; i<8; i++) {
            const haze = document.createElement('div');
            haze.className = 'fog-haze';
            haze.style.animationDuration = `${15 + Math.random() * 15}s`;
            haze.style.animationDelay = `${Math.random() * 5}s`;
            haze.style.top = `${Math.random() * 100}vh`;
            container.appendChild(haze);
        }
    }
}

// Add Intersection Observer for scroll animations
document.addEventListener('DOMContentLoaded', () => {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const scrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Give a slight delay so initial render layout shift doesn't instantly trigger them
    setTimeout(() => {
        document.querySelectorAll('.scroll-reveal').forEach(el => {
            scrollObserver.observe(el);
        });
    }, 500);

    // Interactive WebGL Globe Initialization
    const globeContainer = document.getElementById('globe-viz');
    if (globeContainer && window.Globe) {
        window.myGlobe = Globe()
            (globeContainer)
            .globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
            .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
            .backgroundColor('rgba(0,0,0,0)') // Transparent background to show glass
            .showAtmosphere(true)
            .atmosphereColor('lightskyblue')
            .atmosphereAltitude(0.15)
            .width(globeContainer.clientWidth)
            .height(globeContainer.clientHeight);

        // Auto rotate
        window.myGlobe.controls().autoRotate = true;
        window.myGlobe.controls().autoRotateSpeed = 0.5;
        window.myGlobe.controls().enableZoom = false; // keep scroll smooth

        // Default pins
        const defaultPins = [
            { lat: 28.6139, lng: 77.2090, label: 'Delhi' },
            { lat: 19.0760, lng: 72.8777, label: 'Mumbai' },
            { lat: 51.5074, lng: -0.1278, label: 'London' },
            { lat: 40.7128, lng: -74.0060, label: 'New York' },
            { lat: 35.6762, lng: 139.6503, label: 'Tokyo' }
        ];

        window.myGlobe.pointsData(defaultPins)
            .pointAltitude(0)
            .pointColor(() => '#FF8C7A')
            .pointRadius(0.8);

        // Resize listener
        window.addEventListener('resize', () => {
            window.myGlobe.width(globeContainer.clientWidth);
            window.myGlobe.height(globeContainer.clientHeight);
        });
    }
});
