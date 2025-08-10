import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';

const WeatherPage = () => {
    const { 
        pincode: globalPincode, 
        locationDetails, 
        weather: weatherData, 
        loading, 
        error,
        updatePincode 
    } = useAppContext();
    
    const [pincode, setPincode] = useState(globalPincode || '');

    const handleSubmit = (e) => {
        e.preventDefault();
        updatePincode(pincode);
    };

    return (
        <div className="w-full max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Weather Forecast</h1>
            
            <form onSubmit={handleSubmit} className="mb-6 flex gap-2">
                <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 6-digit pincode"
                    maxLength="6"
                    className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                />
                <button type="submit" disabled={loading} className="px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark disabled:bg-gray-400">
                    {loading ? 'Loading...' : 'Get Forecast'}
                </button>
            </form>

            {error && <p className="text-red-500 bg-red-100 p-3 rounded-lg">{error}</p>}

            {loading && (
                <div className="text-center p-8">
                    <p className="text-lg font-semibold">Loading weather data...</p>
                </div>
            )}

            {!loading && !error && !weatherData && (
                 <p className="text-center text-gray-500 mt-8">Enter a pincode to see the weather forecast.</p>
            )}

            {weatherData && locationDetails && (
                <div className="mt-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                        7-Day Forecast for {locationDetails.district}, {locationDetails.state}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {weatherData.forecast.map((day, index) => (
                            <DailyForecastCard key={index} day={day} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const DailyForecastCard = ({ day }) => {
    const getFormattedDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    };

    const getWeatherIcon = (conditionText) => {
        const condition = conditionText.toLowerCase();
        if (condition.includes('rain') || condition.includes('drizzle')) return '🌧️';
        if (condition.includes('cloud') || condition.includes('overcast')) return '☁️';
        if (condition.includes('sunny') || condition.includes('clear')) return '☀️';
        if (condition.includes('thunder')) return '⚡️';
        if (condition.includes('snow') || condition.includes('sleet')) return '❄️';
        if (condition.includes('mist') || condition.includes('fog')) return '🌫️';
        return '☀️';
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
            <p className="font-bold text-lg text-gray-800">{getFormattedDate(day.date)}</p>
            <div className="flex items-center justify-between mt-2">
                <div className="flex items-center">
                    <span className="text-4xl">{getWeatherIcon(day.day.condition.text)}</span>
                    <p className="ml-3 text-2xl font-bold text-primary">{day.day.avgtemp_c}°C</p>
                </div>
                <div className="text-right text-sm text-gray-600">
                    <p>Max: {day.day.maxtemp_c}°C</p>
                    <p>Min: {day.day.mintemp_c}°C</p>
                </div>
            </div>
            <p className="text-sm text-gray-700 mt-3">{day.day.condition.text}</p>
        </div>
    );
};

export default WeatherPage;
