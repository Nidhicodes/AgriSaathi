import React from 'react';
import { motion } from 'framer-motion';
import ConfidenceScore from './ConfidenceScore';
import Sources from './Sources';
import WeatherCard from './WeatherCard';
import MandiPriceCard from './MandiPriceCard';
import BotAvatar from './BotAvatar';

const MessageBubble = ({ message }) => {
    const { text, sender, confidence, sources, weather, market } = message;
    const isUser = sender === 'user';

    const speak = (textToSpeak) => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(textToSpeak);
           
            utterance.lang = text.match(/[\u0900-\u097F]/) ? 'hi-IN' : 'en-US';
            speechSynthesis.speak(utterance);
        }
    };

    const bubbleStyle = isUser
        ? "bg-primary/10 border border-primary text-gray-800"
        : "bg-white shadow-md";

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'} message-bubble`}
        >
            {!isUser && <BotAvatar />}
            <div className={`rounded-2xl px-5 py-3 w-full max-w-xl ${bubbleStyle}`}>
                <p className="whitespace-pre-wrap">{text}</p>
                
                {!isUser && (
                    <div className="mt-4 font-data space-y-3">
                        <WeatherCard weather={weather} />
                        <MandiPriceCard market={market} />
                        <Sources sources={sources} />
                        <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
                            <ConfidenceScore score={confidence} />
                            <button onClick={() => speak(text)} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
                                🔊
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default MessageBubble;
