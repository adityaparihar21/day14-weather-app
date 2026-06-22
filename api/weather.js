export default async function handler(req, res) {
    const { city } = req.query;
    const API_KEY = process.env.API_KEY;

    if (!city) {
        return res.status(400).json({ message: "City parameter is required" });
    }

    if (!API_KEY) {
        return res.status(500).json({ message: "API key is not configured on the server" });
    }

    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json(data);
        }

        return res.status(200).json(data);
    } catch (error) {
        console.error("Error fetching weather data:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
