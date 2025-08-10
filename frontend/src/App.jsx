import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ChatBox from './components/ChatBox';
import LanguageToggle from './components/LanguageToggle';
import { useAppContext } from './context/AppContext';
import { api } from './api';
import ChatHistory from './components/ChatHistory';
import EquipmentList from './components/agri-share/EquipmentList';

const WeatherDisplay = () => {
    const { weather, locationDetails } = useAppContext();
    const { t } = useTranslation();

    if (!weather || !weather.forecast || weather.forecast.length === 0 || !locationDetails) {
        return <div className="text-right text-sm">{t('header.weather_prompt')}</div>;
    }
    const todayForecast = weather.forecast[0];
    const conditionText = todayForecast.day.condition.text.toLowerCase();
    let weatherIcon = '☀️';
    if (conditionText.includes('cloud') || conditionText.includes('overcast')) weatherIcon = '☁️';
    if (conditionText.includes('rain') || conditionText.includes('drizzle')) weatherIcon = '🌧️';
    if (conditionText.includes('thunder')) weatherIcon = '⚡️';
    return (
        <div className="text-right">
            <div className="flex items-center justify-end space-x-2">
                <p className="font-bold text-lg">{todayForecast.day.avgtemp_c}°C</p>
                <span className="text-2xl">{weatherIcon}</span>
            </div>
            <p className="text-xs">{locationDetails.district}, {locationDetails.state}</p>
        </div>
    );
};

function App() {
    const { pincode, setWeather, locationDetails } = useAppContext();
    const { t } = useTranslation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const fetchWeather = async () => {
            if (pincode && locationDetails) {
                try {
                    const weatherData = await api.getWeather(pincode);
                    setWeather(weatherData);
                } catch (error) {
                    console.error("Failed to fetch weather for header:", error);
                    setWeather(null);
                }
            }
        };
        fetchWeather();
    }, [pincode, locationDetails, setWeather]);

    // Close sidebar on route change on mobile
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [location.pathname]);


    return (
        <div className="bg-gray-50 font-sans text-gray-800 min-h-screen flex relative">
            <ChatHistory isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
            
            <div className="flex flex-col flex-grow">
                <header className="w-full bg-primary text-white shadow-md z-20">
                    <div className="container mx-auto p-4 flex justify-between items-center">
                        <div className="flex items-center">
                            {/* Hamburger Menu Button - visible only on small screens */}
                            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden mr-4 p-2 text-white">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
                            </button>
                            <div>
                                <h1 className="text-xl md:text-2xl font-bold">{t('header.title')}</h1>
                                <p className="text-xs md:text-sm text-green-200">{t('header.subtitle')}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 md:space-x-4">
                            <WeatherDisplay />
                            <LanguageToggle />
                        </div>
                    </div>
                    <nav className="bg-primary-dark">
                        <div className="container mx-auto flex justify-center space-x-6">
                            <Link to="/" className={`py-2 px-4 transition-colors ${location.pathname === '/' ? 'text-white bg-primary-light' : 'text-green-200 hover:bg-primary-light'}`}>{t('nav.chat')}</Link>
                            <Link to="/agri-share" className={`py-2 px-4 transition-colors ${location.pathname === '/agri-share' ? 'text-white bg-primary-light' : 'text-green-200 hover:bg-primary-light'}`}>{t('nav.agri_share')}</Link>
                        </div>
                    </nav>
                </header>
                <main className="flex-grow flex flex-col items-center justify-start w-full p-4">
                    <Routes>
                        <Route path="/" element={<ChatBox />} />
                        <Route path="/agri-share" element={<EquipmentList />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
}

const AppWrapper = () => (
    <Router>
        <App />
    </Router>
);

export default AppWrapper;
