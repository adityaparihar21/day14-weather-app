
const searchInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const weatherCard = document.getElementById('weather-card');
const loading = document.getElementById('loading');
const errorMessage = document.getElementById('error-message');
const errorText = document.getElementById('error-text');

// Weather DOM Elements
const cityNameEl = document.getElementById('city-name');
const tempEl = document.getElementById('temperature');
const conditionEl = document.getElementById('weather-condition');
const humidityEl = document.getElementById('humidity');
const windSpeedEl = document.getElementById('wind-speed');
const iconEl = document.getElementById('weather-icon');

searchBtn.addEventListener('click', () => {
    const city = searchInput.value.trim();
    if (city) {
        getWeather(city);
    }
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = searchInput.value.trim();
        if (city) {
            getWeather(city);
        }
    }
});

async function getWeather(city) {
    // Hide existing elements and show loading
    weatherCard.classList.add('hidden');
    errorMessage.classList.add('hidden');
    loading.classList.remove('hidden');

    try {
        const response = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || (response.status === 404 ? 'City Not Found' : 'Something went wrong while fetching data.'));
        }
        
        // Hide loading and show weather data
        loading.classList.add('hidden');
        displayWeather(data);
        
    } catch (error) {
        console.log(error);
        loading.classList.add('hidden');
        errorText.textContent = error.message;
        errorMessage.classList.remove('hidden');
    }
}

function displayWeather(data) {
    cityNameEl.textContent = data.name;
    tempEl.textContent = Math.round(data.main.temp);
    conditionEl.textContent = data.weather[0].description;
    humidityEl.textContent = `${data.main.humidity}%`;
    
    // Convert m/s to km/h for a more standard reading
    const windSpeedKmh = Math.round(data.wind.speed * 3.6);
    windSpeedEl.textContent = `${windSpeedKmh} km/h`;

    const iconCode = data.weather[0].icon;
    iconEl.src = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;
    
    weatherCard.classList.remove('hidden');
}
