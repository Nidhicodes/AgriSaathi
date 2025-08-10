import React, { useState } from 'react';

const MandiPriceCard = ({ market }) => {
    const [isOpen, setIsOpen] = useState(true);

    if (!market || !market.market_data || market.market_data.length === 0) {
        return null;
    }

    return (
        <div className="bg-secondary/10 p-3 rounded-xl font-data">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center">
                <h3 className="font-bold text-sm text-yellow-800">Nearby Mandi Prices</h3>
                <span className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                    ▼
                </span>
            </button>
            <div className={`overflow-hidden transition-all duration-500 ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
                <div className="overflow-x-auto pt-2">
                    <table className="w-full text-xs text-left">
                        <thead className="text-yellow-900">
                            <tr>
                                <th className="p-2 font-semibold">Commodity</th>
                                <th className="p-2 font-semibold text-right">Modal Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            {market.market_data.slice(0, 5).map((item, index) => (
                                <tr key={index} className="border-t border-secondary/20">
                                    <td className="p-2">
                                        <p className="font-bold">{item.commodity}</p>
                                    <p className="text-gray-600">{item.apmc}</p>
                                    </td>
                                    <td className="p-2 text-right font-bold text-base">₹{item.modal_price}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default MandiPriceCard;
