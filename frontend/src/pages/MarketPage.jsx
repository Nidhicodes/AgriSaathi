import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import MarketDataCard from '../components/MarketDataCard'; // Import the new card

const MarketPage = () => {
    const { 
        pincode: globalPincode, 
        marketData, 
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
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Market Prices</h1>
            
            <form onSubmit={handleSubmit} className="mb-6 flex flex-wrap gap-2">
                <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 6-digit pincode"
                    maxLength="6"
                    className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                />
                <button type="submit" disabled={loading} className="px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark disabled:bg-gray-400">
                    {loading ? 'Loading...' : 'Get Prices'}
                </button>
            </form>

            {error && <p className="text-red-500 bg-red-100 p-3 rounded-lg">{error}</p>}

            {loading && <p className="text-center p-8 text-lg font-semibold">Loading market data...</p>}
            
            {!loading && marketData.length === 0 && !error && (
                <p className="text-center text-gray-500 mt-8">Enter a pincode to see market prices for your state.</p>
            )}

            {marketData.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {marketData.map((item, index) => (
                        <MarketDataCard key={index} item={item} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default MarketPage;
