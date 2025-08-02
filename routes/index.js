import express from "express";
import axios from "axios";

const router = express.Router();

router.get("/", (req, res) => {
  res.render("index", {
    title: "TravelWise",
    message: "Welcome to TravelWise!",
  });
});

// Test route to verify API connectivity
router.get("/test-api", async (req, res) => {
  const results = {
    timestamp: new Date().toISOString(),
    apis: {},
  };

  // Test 1: RestCountries API
  try {
    const countriesResponse = await axios.get(
      "https://restcountries.com/v3.1/region/europe?fields=name,capital,flag,currencies"
    );
    results.apis.restCountries = {
      status: "✅ WORKING",
      message: `Found ${countriesResponse.data.length} countries`,
      sampleData: countriesResponse.data.slice(0, 2).map((c) => ({
        name: c.name.common,
        capital: c.capital ? c.capital[0] : "N/A",
        flag: c.flag,
      })),
    };
  } catch (error) {
    results.apis.restCountries = {
      status: "❌ FAILED",
      message: error.message,
    };
  }

  // Test 2: OpenWeatherMap API
  try {
    if (process.env.OPENWEATHER_API_KEY) {
      const weatherResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=Paris&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`
      );
      results.apis.openWeatherMap = {
        status: "✅ WORKING",
        message: "API key valid and working",
        sampleData: {
          city: "Paris",
          temperature: weatherResponse.data.main.temp,
          weather: weatherResponse.data.weather[0].main,
        },
      };
    } else {
      results.apis.openWeatherMap = {
        status: "⚠️ NO API KEY",
        message: "OPENWEATHER_API_KEY not found in environment variables",
      };
    }
  } catch (error) {
    results.apis.openWeatherMap = {
      status: "❌ FAILED",
      message: error.message,
    };
  }

  // Test 3: ExchangeRate.host API
  try {
    const rateResponse = await axios.get(
      "https://api.exchangerate.host/latest?base=USD&symbols=EUR,GBP,JPY"
    );
    results.apis.exchangeRateHost = {
      status: "✅ WORKING",
      message: "Exchange rates retrieved successfully",
      sampleData: rateResponse.data.rates,
    };
  } catch (error) {
    results.apis.exchangeRateHost = {
      status: "❌ FAILED",
      message: error.message,
    };
  }

  // Overall status
  const workingApis = Object.values(results.apis).filter((api) =>
    api.status.includes("✅")
  ).length;
  const totalApis = Object.keys(results.apis).length;

  results.summary = {
    workingApis: `${workingApis}/${totalApis}`,
    recommendation:
      workingApis === totalApis
        ? "All APIs working! You're getting real data."
        : workingApis > 0
        ? "Some APIs working, others using fallback data."
        : "All APIs failed, using fallback data only.",
  };

  res.json(results);
});

const mockDestinations = [
  {
    id: "1",
    name: "Bali",
    country: "Indonesia",
    flag: "🇮🇩",
    temperature: 28,
    weather: "sunny",
    currency: "IDR",
    exchangeRate: 0.000067,
    coordinates: { lat: -8.3405, lng: 115.092 },
    matchScore: 95,
    budgetBreakdown: [
      { name: "Accommodation", value: 35, color: "#8884d8" },
      { name: "Food", value: 25, color: "#82ca9d" },
      { name: "Activities", value: 20, color: "#ffc658" },
      { name: "Transport", value: 20, color: "#ff7300" },
    ],
  },
];

// POST form submission → process data and call APIs
router.post("/plan-trip", async (req, res) => {
  try {
    // Step 1: Parse form data
    const { budget, region, month, interests, travelMode } = req.body;

    console.log("Form data received:", {
      budget,
      region,
      month,
      interests: interests ? interests.split(",") : [],
      travelMode,
    });

    let destinations = [];

    // Step 2: Try to get countries from RestCountries API (free, no key needed)
    try {
      const countriesResponse = await axios.get(
        `https://restcountries.com/v3.1/region/${region.toLowerCase()}`
      );
      const countries = countriesResponse.data;

      console.log(`Found ${countries.length} countries in ${region}`);

      // Step 3: Process countries data with fallback data
      destinations = await Promise.all(
        countries.slice(0, 6).map(async (country, index) => {
          // Default fallback data
          let weatherData = {
            temperature: Math.floor(Math.random() * 15) + 20, // 20-35°C
            weather: ["sunny", "cloudy", "partly-cloudy"][
              Math.floor(Math.random() * 3)
            ],
          };
          let coordinates = {
            lat: Math.random() * 180 - 90,
            lng: Math.random() * 360 - 180,
          };
          let exchangeRate = Math.random() * 100 + 0.01; // Random rate

          // Try to get real weather data if API key exists
          if (
            process.env.OPENWEATHER_API_KEY &&
            country.capital &&
            country.capital[0]
          ) {
            try {
              const weatherResponse = await axios.get(
                `https://api.openweathermap.org/data/2.5/weather?q=${country.capital[0]}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`
              );
              weatherData = {
                temperature: Math.round(weatherResponse.data.main.temp),
                weather: weatherResponse.data.weather[0].main.toLowerCase(),
              };
              coordinates = {
                lat: weatherResponse.data.coord.lat,
                lng: weatherResponse.data.coord.lon,
              };
              console.log(`✓ Got real weather for ${country.capital[0]}`);
            } catch (weatherError) {
              console.log(`→ Using fallback weather for ${country.capital[0]}`);
            }
          }

          // Try to get real exchange rate (free API, no key needed)
          const currencyCode = Object.keys(country.currencies || {})[0];
          if (currencyCode && currencyCode !== "USD") {
            try {
              const rateResponse = await axios.get(
                `https://api.exchangerate.host/latest?base=USD&symbols=${currencyCode}`
              );
              if (
                rateResponse.data.rates &&
                rateResponse.data.rates[currencyCode]
              ) {
                exchangeRate = rateResponse.data.rates[currencyCode];
                console.log(`✓ Got real exchange rate for ${currencyCode}`);
              }
            } catch (rateError) {
              console.log(`→ Using fallback exchange rate for ${currencyCode}`);
            }
          }

          // Calculate match score based on interests and other factors
          const userInterests = interests
            ? interests.split(",").map((i) => i.trim().toLowerCase())
            : [];
          let matchScore = Math.floor(Math.random() * 30) + 70; // Base score 70-100

          // Adjust match score based on budget
          const estimatedCost = Math.floor(Math.random() * 2000) + 1000;
          if (budget && estimatedCost <= parseInt(budget)) {
            matchScore += 10;
          }

          // Boost score for interest matching (simple keyword matching)
          if (userInterests.length > 0) {
            const countryName = country.name.common.toLowerCase();
            const hasBeach =
              userInterests.includes("beach") &&
              (countryName.includes("island") ||
                countryName.includes("coast") ||
                ["thailand", "greece", "spain", "italy", "croatia"].some(
                  (coastal) => countryName.includes(coastal)
                ));
            const hasMountains =
              userInterests.includes("mountains") &&
              ["switzerland", "austria", "nepal", "peru", "chile"].some(
                (mountainous) => countryName.includes(mountainous)
              );

            if (hasBeach || hasMountains) matchScore += 15;
          }

          return {
            id: (index + 1).toString(),
            name:
              country.capital && country.capital[0]
                ? country.capital[0]
                : country.name.common,
            country: country.name.common,
            flag: country.flag || "🏴",
            temperature: weatherData.temperature,
            weather: weatherData.weather,
            currency: currencyCode || "USD",
            exchangeRate: parseFloat(exchangeRate.toFixed(4)),
            coordinates: coordinates,
            matchScore: Math.min(matchScore, 100),
            budgetBreakdown: [
              { name: "Accommodation", value: 35, color: "#8884d8" },
              { name: "Food", value: 25, color: "#82ca9d" },
              { name: "Activities", value: 20, color: "#ffc658" },
              { name: "Transport", value: 20, color: "#ff7300" },
            ],
          };
        })
      );
    } catch (countriesError) {
      console.log(
        "RestCountries API failed, using fallback destinations:",
        countriesError.message
      );

      // Fallback to enhanced mock data based on selected region
      destinations = generateFallbackDestinations(region, budget, interests);
    }

    // Filter out null results and sort by match score
    const validDestinations = destinations
      .filter((dest) => dest !== null)
      .sort((a, b) => b.matchScore - a.matchScore);

    console.log(
      `✓ Serving ${validDestinations.length} destinations for ${region}`
    );

    res.render("results", {
      destinations: validDestinations,
      destinationsJSON: JSON.stringify(validDestinations),
      searchParams: { budget, region, month, interests, travelMode },
    });
  } catch (error) {
    console.error("Error in /plan-trip:", error.message);

    // Ultimate fallback to original mock data
    res.render("results", {
      destinations: mockDestinations,
      destinationsJSON: JSON.stringify(mockDestinations),
      error: "Service temporarily unavailable. Showing sample results.",
    });
  }
});

// Helper function to generate fallback destinations based on region
function generateFallbackDestinations(region, budget, interests) {
  const regionDestinations = {
    Europe: [
      { name: "Paris", country: "France", flag: "🇫🇷", currency: "EUR" },
      { name: "Rome", country: "Italy", flag: "🇮🇹", currency: "EUR" },
      { name: "Barcelona", country: "Spain", flag: "🇪🇸", currency: "EUR" },
      {
        name: "Amsterdam",
        country: "Netherlands",
        flag: "🇳🇱",
        currency: "EUR",
      },
      {
        name: "Prague",
        country: "Czech Republic",
        flag: "🇨🇿",
        currency: "CZK",
      },
    ],
    Asia: [
      { name: "Tokyo", country: "Japan", flag: "🇯🇵", currency: "JPY" },
      { name: "Bangkok", country: "Thailand", flag: "🇹🇭", currency: "THB" },
      { name: "Singapore", country: "Singapore", flag: "🇸🇬", currency: "SGD" },
      { name: "Seoul", country: "South Korea", flag: "🇰🇷", currency: "KRW" },
      {
        name: "Kuala Lumpur",
        country: "Malaysia",
        flag: "🇲🇾",
        currency: "MYR",
      },
    ],
    Africa: [
      {
        name: "Cape Town",
        country: "South Africa",
        flag: "🇿🇦",
        currency: "ZAR",
      },
      { name: "Cairo", country: "Egypt", flag: "🇪🇬", currency: "EGP" },
      { name: "Marrakech", country: "Morocco", flag: "🇲🇦", currency: "MAD" },
      { name: "Nairobi", country: "Kenya", flag: "🇰🇪", currency: "KES" },
      { name: "Lagos", country: "Nigeria", flag: "🇳🇬", currency: "NGN" },
    ],
    "North America": [
      {
        name: "New York",
        country: "United States",
        flag: "🇺🇸",
        currency: "USD",
      },
      { name: "Toronto", country: "Canada", flag: "🇨🇦", currency: "CAD" },
      { name: "Mexico City", country: "Mexico", flag: "🇲🇽", currency: "MXN" },
      { name: "Vancouver", country: "Canada", flag: "🇨🇦", currency: "CAD" },
      {
        name: "Los Angeles",
        country: "United States",
        flag: "🇺🇸",
        currency: "USD",
      },
    ],
    "South America": [
      {
        name: "Rio de Janeiro",
        country: "Brazil",
        flag: "🇧🇷",
        currency: "BRL",
      },
      {
        name: "Buenos Aires",
        country: "Argentina",
        flag: "🇦🇷",
        currency: "ARS",
      },
      { name: "Lima", country: "Peru", flag: "🇵🇪", currency: "PEN" },
      { name: "Santiago", country: "Chile", flag: "🇨🇱", currency: "CLP" },
      { name: "Bogotá", country: "Colombia", flag: "🇨🇴", currency: "COP" },
    ],
    Australia: [
      { name: "Sydney", country: "Australia", flag: "🇦🇺", currency: "AUD" },
      { name: "Melbourne", country: "Australia", flag: "🇦🇺", currency: "AUD" },
      { name: "Auckland", country: "New Zealand", flag: "🇳🇿", currency: "NZD" },
      { name: "Brisbane", country: "Australia", flag: "🇦🇺", currency: "AUD" },
      {
        name: "Wellington",
        country: "New Zealand",
        flag: "🇳🇿",
        currency: "NZD",
      },
    ],
  };

  const destinations =
    regionDestinations[region] || regionDestinations["Europe"];

  return destinations.map((dest, index) => ({
    id: (index + 1).toString(),
    name: dest.name,
    country: dest.country,
    flag: dest.flag,
    temperature: Math.floor(Math.random() * 15) + 20,
    weather: ["sunny", "cloudy", "partly-cloudy"][
      Math.floor(Math.random() * 3)
    ],
    currency: dest.currency,
    exchangeRate: Math.random() * 100 + 0.01,
    coordinates: {
      lat: Math.random() * 180 - 90,
      lng: Math.random() * 360 - 180,
    },
    matchScore: Math.floor(Math.random() * 30) + 70,
    budgetBreakdown: [
      { name: "Accommodation", value: 35, color: "#8884d8" },
      { name: "Food", value: 25, color: "#82ca9d" },
      { name: "Activities", value: 20, color: "#ffc658" },
      { name: "Transport", value: 20, color: "#ff7300" },
    ],
  }));
}

// GET route for destinations page
router.get("/destinations", (req, res) => {
  // Enhanced mock destinations with additional data for the destinations page
  const enhancedDestinations = [
    {
      id: "1",
      name: "Bali",
      country: "Indonesia",
      flag: "🇮🇩",
      temperature: 28,
      weather: "sunny",
      currency: "IDR",
      exchangeRate: 0.000067,
      coordinates: { lat: -8.3405, lng: 115.092 },
      matchScore: 95,
      description:
        "A tropical paradise with stunning beaches, ancient temples, and vibrant culture. Perfect for relaxation and adventure seekers alike.",
      bestTimeToVisit: "April to October (dry season)",
      popularActivities: [
        "Beach hopping",
        "Temple visits",
        "Rice terraces",
        "Surfing",
        "Yoga retreats",
      ],
      budgetBreakdown: [
        { name: "Accommodation", value: 35, color: "#8884d8" },
        { name: "Food", value: 25, color: "#82ca9d" },
        { name: "Activities", value: 20, color: "#ffc658" },
        { name: "Transport", value: 20, color: "#ff7300" },
      ],
    },
    {
      id: "2",
      name: "Tokyo",
      country: "Japan",
      flag: "🇯🇵",
      temperature: 22,
      weather: "partly-cloudy",
      currency: "JPY",
      exchangeRate: 110.0,
      coordinates: { lat: 35.6762, lng: 139.6503 },
      matchScore: 92,
      description:
        "A bustling metropolis where traditional culture meets cutting-edge technology. Experience world-class cuisine and unique attractions.",
      bestTimeToVisit: "March to May, September to November",
      popularActivities: [
        "Temple visits",
        "Sushi tours",
        "Shopping",
        "Cherry blossoms",
        "Tech districts",
      ],
      budgetBreakdown: [
        { name: "Accommodation", value: 40, color: "#8884d8" },
        { name: "Food", value: 30, color: "#82ca9d" },
        { name: "Activities", value: 15, color: "#ffc658" },
        { name: "Transport", value: 15, color: "#ff7300" },
      ],
    },
    {
      id: "3",
      name: "Paris",
      country: "France",
      flag: "🇫🇷",
      temperature: 18,
      weather: "cloudy",
      currency: "EUR",
      exchangeRate: 0.85,
      coordinates: { lat: 48.8566, lng: 2.3522 },
      matchScore: 90,
      description:
        "The City of Light offers world-renowned art, cuisine, and architecture. A romantic destination with endless cultural attractions.",
      bestTimeToVisit: "April to June, September to October",
      popularActivities: [
        "Museums",
        "Café culture",
        "Architecture",
        "River cruises",
        "Fashion shopping",
      ],
      budgetBreakdown: [
        { name: "Accommodation", value: 45, color: "#8884d8" },
        { name: "Food", value: 25, color: "#82ca9d" },
        { name: "Activities", value: 20, color: "#ffc658" },
        { name: "Transport", value: 10, color: "#ff7300" },
      ],
    },
    {
      id: "4",
      name: "Bangkok",
      country: "Thailand",
      flag: "🇹🇭",
      temperature: 32,
      weather: "sunny",
      currency: "THB",
      exchangeRate: 33.5,
      coordinates: { lat: 13.7563, lng: 100.5018 },
      matchScore: 88,
      description:
        "A vibrant city known for its ornate temples, bustling street life, and incredible street food scene.",
      bestTimeToVisit: "November to March",
      popularActivities: [
        "Temple tours",
        "Street food",
        "Markets",
        "River tours",
        "Nightlife",
      ],
      budgetBreakdown: [
        { name: "Accommodation", value: 30, color: "#8884d8" },
        { name: "Food", value: 20, color: "#82ca9d" },
        { name: "Activities", value: 25, color: "#ffc658" },
        { name: "Transport", value: 25, color: "#ff7300" },
      ],
    },
    {
      id: "5",
      name: "Rome",
      country: "Italy",
      flag: "🇮🇹",
      temperature: 24,
      weather: "sunny",
      currency: "EUR",
      exchangeRate: 0.85,
      coordinates: { lat: 41.9028, lng: 12.4964 },
      matchScore: 87,
      description:
        "The Eternal City where ancient history comes alive. Explore ruins, world-class art, and incredible Italian cuisine.",
      bestTimeToVisit: "April to June, September to October",
      popularActivities: [
        "Ancient ruins",
        "Vatican tours",
        "Italian cuisine",
        "Art galleries",
        "Walking tours",
      ],
      budgetBreakdown: [
        { name: "Accommodation", value: 40, color: "#8884d8" },
        { name: "Food", value: 25, color: "#82ca9d" },
        { name: "Activities", value: 25, color: "#ffc658" },
        { name: "Transport", value: 10, color: "#ff7300" },
      ],
    },
    {
      id: "6",
      name: "Barcelona",
      country: "Spain",
      flag: "🇪🇸",
      temperature: 26,
      weather: "sunny",
      currency: "EUR",
      exchangeRate: 0.85,
      coordinates: { lat: 41.3851, lng: 2.1734 },
      matchScore: 85,
      description:
        "A Mediterranean gem with stunning architecture, beautiful beaches, and a vibrant cultural scene.",
      bestTimeToVisit: "May to September",
      popularActivities: [
        "Gaudí architecture",
        "Beach time",
        "Tapas tours",
        "Museums",
        "Nightlife",
      ],
      budgetBreakdown: [
        { name: "Accommodation", value: 35, color: "#8884d8" },
        { name: "Food", value: 25, color: "#82ca9d" },
        { name: "Activities", value: 25, color: "#ffc658" },
        { name: "Transport", value: 15, color: "#ff7300" },
      ],
    },
  ];

  res.render("destinations", {
    destinations: enhancedDestinations,
    destinationsJSON: JSON.stringify(enhancedDestinations),
    title: "Popular Destinations - TravelWise",
  });
});

// GET route for about page
router.get("/about", (req, res) => {
  res.render("about", {
    title: "About Us - TravelWise",
  });
});

// GET route for destination details
router.get("/destination/:id", (req, res) => {
  const destinationId = req.params.id;

  // For now, we'll use mock data, but this could come from a database
  // or be stored in session from the previous search
  const mockDestination = {
    id: destinationId,
    name: "Paris",
    country: "France",
    flag: "🇫🇷",
    temperature: 22,
    weather: "sunny",
    currency: "EUR",
    exchangeRate: 0.85,
    coordinates: { lat: 48.8566, lng: 2.3522 },
    matchScore: 95,
    budgetBreakdown: [
      { name: "Accommodation", value: 35, color: "#8884d8" },
      { name: "Food", value: 25, color: "#82ca9d" },
      { name: "Activities", value: 20, color: "#ffc658" },
      { name: "Transport", value: 20, color: "#ff7300" },
    ],
  };

  res.render("details", {
    destination: mockDestination,
    title: `${mockDestination.name} - TravelWise`,
  });
});

export default router;
