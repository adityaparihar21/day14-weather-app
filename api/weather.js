export default async function handler(req, res) {
    const { city, lat, lon } = req.query;
    const API_KEY = process.env.API_KEY;

    if (!city && (!lat || !lon)) {
        return res.status(400).json({ message: "City or coordinates (lat, lon) are required" });
    }

    if (!API_KEY) {
        return res.status(500).json({ message: "API key is not configured on the server" });
    }

    try {
        // 1. Fetch Current Weather (also gives us Coordinates)
        let currentUrl;
        if (lat && lon) {
            currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
        } else {
            currentUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
        }
        const currentRes = await fetch(currentUrl);
        const currentData = await currentRes.json();

        if (!currentRes.ok) {
            return res.status(currentRes.status).json(currentData);
        }

        const fetchedLat = currentData.coord.lat;
        const fetchedLon = currentData.coord.lon;

        // 2. Fetch 5-Day Forecast, Air Pollution, and Geocoding (for State name) concurrently
        const [forecastRes, airRes, geoRes] = await Promise.all([
            fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${fetchedLat}&lon=${fetchedLon}&appid=${API_KEY}&units=metric`),
            fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${fetchedLat}&lon=${fetchedLon}&appid=${API_KEY}`),
            fetch(`http://api.openweathermap.org/geo/1.0/reverse?lat=${fetchedLat}&lon=${fetchedLon}&limit=1&appid=${API_KEY}`)
        ]);

        const forecastData = await forecastRes.json();
        const airData = await airRes.json();
        const geoData = await geoRes.json();

        // 3. Assemble unified payload
        const unifiedData = {
            current: currentData,
            forecast: forecastData,
            airQuality: airData,
            locationInfo: geoData[0] || null
        };

        return res.status(200).json(unifiedData);
    } catch (error) {
        console.error("Error fetching weather data:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
