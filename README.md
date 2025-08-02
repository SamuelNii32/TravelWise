# TravelWise - Smart Travel Planning Platform

A Node.js web application that helps users plan their perfect trip by integrating multiple APIs to provide real-time travel information.

## 🌟 Features

- **Smart Destination Recommendations** - Get personalized suggestions based on your budget and interests
- **Real-time Weather Integration** - Live weather data for destination planning
- **Live Currency Exchange Rates** - Up-to-date currency conversion rates
- **Interactive Planning Form** - Easy-to-use interface for trip customization
- **Responsive Design** - Works perfectly on desktop, tablet, and mobile devices
- **Multiple Page Navigation** - Home, Results, Details, Destinations, and About pages

## 🚀 APIs Integrated

This project successfully integrates **3 different APIs**:

1. **RestCountries API** - Fetches real country information, capitals, flags, and regional data
2. **OpenWeatherMap API** - Provides real-time weather data and coordinates for destinations
3. **ExchangeRate.host API** - Delivers live currency exchange rates for budget planning

## 🛠️ Technologies Used

- **Backend**: Node.js & Express.js
- **View Engine**: Pug templating
- **HTTP Client**: Axios for API calls
- **Frontend**: HTML5, CSS3, JavaScript
- **Styling**: Custom CSS with responsive design
- **Environment**: dotenv for configuration management

## 📋 Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm package manager
- OpenWeatherMap API key (free registration)

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/SamuelNii32/TravelWise.git
   cd TravelWise
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   Create a `.env` file in the root directory:
   ```env
   OPENWEATHER_API_KEY=your_openweather_api_key_here
   PORT=3000
   ```

4. **Get your OpenWeatherMap API key**
   - Visit [OpenWeatherMap](https://openweathermap.org/api)
   - Sign up for a free account
   - Copy your API key to the `.env` file

5. **Start the application**
   ```bash
   npm start
   ```

6. **Open in browser**
   Navigate to `http://localhost:3000`

## 🧪 API Testing

Visit `http://localhost:3000/test-api` to verify all API connections are working properly. This endpoint shows:
- ✅ RestCountries API status
- ✅ OpenWeatherMap API status  
- ✅ ExchangeRate API status

## 📱 How to Use

1. **Home Page** - Fill out the travel planning form with your preferences:
   - Budget range
   - Preferred region
   - Travel month
   - Interests (adventure, culture, relaxation, etc.)
   - Travel mode

2. **Results Page** - View personalized destination recommendations with:
   - Match scores based on your preferences
   - Real weather data
   - Currency information
   - Interactive budget breakdowns

3. **Details Page** - Explore detailed information about each destination
4. **Destinations Page** - Browse all available destinations
5. **About Page** - Learn more about TravelWise

## 🎯 Key Features

- **Smart Matching Algorithm** - Destinations ranked by compatibility with user preferences
- **Real-time Data** - Live weather and currency information
- **Fallback System** - Graceful handling when APIs are unavailable
- **Mobile-First Design** - Optimized for all screen sizes
- **Professional UI/UX** - Clean, modern interface with smooth interactions

## 🏗️ Project Structure

```
TravelWise/
├── public/
│   ├── css/
│   │   └── main.css
│   ├── js/
│   │   └── main.js
│   └── images/
├── routes/
│   └── index.js
├── views/
│   ├── index.pug
│   ├── results.pug
│   ├── details.pug
│   ├── destinations.pug
│   ├── about.pug
│   └── layout.pug
├── server.js
├── package.json
└── README.md
```

## 🎓 Academic Project

This project was developed for **HTTP5222 - Web Development** course, demonstrating:
- Multiple API integration skills
- Modern web development practices
- Responsive design principles
- Error handling and fallback strategies
- Professional code organization

## 📞 Contact

**Developer**: Samuel Nii  
**Course**: HTTP5222  
**Institution**: Humber College
**GitHub**: [@SamuelNii32](https://github.com/SamuelNii32)

---

*Built with ❤️ for travelers around the world*
