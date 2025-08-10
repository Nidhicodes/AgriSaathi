import React from 'react';

const WeatherCard = ({ weather }) => {
    if (!weather || !weather.forecast || weather.forecast.length === 0) {
        return null;
    }

    return (
        <div className="bg-primary/5 p-3 rounded-xl">
            <h3 className="font-bold text-sm mb-2 text-primary">7-Day Weather Forecast</h3>
            <div className="flex overflow-x-auto space-x-3 pb-2">
                {weather.forecast.map((day) => (
                    <div key={day.date_epoch} className="flex-shrink-0 w-24 text-center bg-white/60 rounded-lg p-2 font-data">
                        <p className="text-sm font-semibold">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}</p>
                        <img src={`https:${day.day.condition.icon}`} alt={day.day.condition.text} className="w-10 h-10 mx-auto" />
                        <p className="text-sm font-bold">{Math.round(day.day.maxtemp_c)}°</p>
                        <p className="text-xs text-gray-500">{Math.round(day.day.mintemp_c)}°</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WeatherCard;
