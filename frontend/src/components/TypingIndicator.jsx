import React from 'react';

const TypingIndicator = () => {
    return (
        <div className="flex items-center space-x-2" data-testid="typing-indicator">
            <div className="w-16 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce-1"></span>
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce-2 mx-1"></span>
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce-3"></span>
            </div>
        </div>
    );
};

export default TypingIndicator;
