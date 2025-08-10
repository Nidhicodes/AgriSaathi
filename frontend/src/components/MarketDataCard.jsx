import React from 'react';

const MarketDataCard = ({ item }) => {
    return (
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 transition-transform transform hover:-translate-y-1">
            <div className="flex justify-between items-start">
                <h3 className="text-lg font-bold text-gray-800">{item.commodity}</h3>
                <span className="text-xs bg-yellow-100 text-yellow-800 font-semibold px-2.5 py-0.5 rounded-full">{item.state}</span>
            </div>
            <p className="text-sm text-gray-500 mb-3">{item.apmc}</p>
            
            <div className="flex justify-between items-end">
                <div>
                    <p className="text-xs text-gray-500">Min Price</p>
                    <p className="font-semibold">₹{item.min_price.toFixed(2)}</p>
                </div>
                <div className="text-center">
                    <p className="text-sm text-primary font-bold">Modal Price</p>
                    <p className="text-2xl font-bold text-primary">₹{item.modal_price.toFixed(2)}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-500 text-right">Max Price</p>
                    <p className="font-semibold text-right">₹{item.max_price.toFixed(2)}</p>
                </div>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-right">per {item.unit}</p>
        </div>
    );
};

export default MarketDataCard;
