import React from 'react';

const Sources = ({ sources }) => {
    if (!sources || sources.length === 0) {
        return null;
    }

    return (
        <div className="text-xs text-gray-500">
            <h4 className="font-bold mb-1">Sources:</h4>
            <ul className="list-disc list-inside space-y-1">
                {sources.map((source, index) => (
                    <li key={index} className="truncate">{source}</li>
                ))}
            </ul>
        </div>
    );
};

export default Sources;
