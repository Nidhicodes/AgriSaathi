import React, { useState, useEffect } from 'react';

const ConfidenceScore = ({ score }) => {
    const [displayScore, setDisplayScore] = useState(0);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setDisplayScore(score);
        }, 100);
        return () => clearTimeout(timeout);
    }, [score]);

    if (typeof score !== 'number') {
        return null;
    }

    const percentage = (displayScore * 100).toFixed(0);
    
    let barColorClass = 'bg-green-500';
    if (percentage < 75) barColorClass = 'bg-yellow-500';
    if (percentage < 50) barColorClass = 'bg-red-500';

    return (
        <div className="w-full max-w-[150px]">
            <div className="flex justify-between items-center mb-1 text-xs">
                <span className="font-bold">Confidence</span>
                <span className="font-bold">{percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                    className={`h-1.5 rounded-full ${barColorClass} transition-all duration-1000 ease-out`}
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
        </div>
    );
};

export default ConfidenceScore;
