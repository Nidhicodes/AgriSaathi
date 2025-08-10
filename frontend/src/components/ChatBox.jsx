import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import { api } from '../api';
import { useAppContext } from '../context/AppContext';

const ChatBox = () => {
    const { pincode, updatePincode, activeChat, addMessageToChat } = useAppContext();
    const { t, i18n } = useTranslation();
    const [localPincode, setLocalPincode] = useState(pincode);
    const [input, setInput] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [isAiTyping, setIsAiTyping] = useState(false);
    const recognitionRef = useRef(null);
    
    const messages = activeChat ? activeChat.messages : [];

    const messagesEndRef = useRef(null);
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    useEffect(scrollToBottom, [messages]);

    useEffect(() => {
        if ('webkitSpeechRecognition' in window) {
            const recognition = new window.webkitSpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            
            const langMap = {
                'en': 'en-US',
                'hi': 'hi-IN',
                'mr': 'mr-IN' 
            };
            recognition.lang = langMap[i18n.language] || 'en-US';
            console.log(`Speech recognition language set to: ${recognition.lang}`);

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setInput(transcript);
            };
            recognition.onerror = (event) => console.error("Speech recognition error", event.error);
            recognition.onend = () => setIsRecording(false);
            recognitionRef.current = recognition;
        }
    }, [i18n.language]);

    const handleVoiceInput = () => {
        if (isRecording) {
            recognitionRef.current.stop();
        } else {
            recognitionRef.current.start();
        }
        setIsRecording(!isRecording);
    };

    useEffect(() => {
        setLocalPincode(pincode);
    }, [pincode]);

    const handleSetPincode = () => {
        if (localPincode.length === 6 && /^\d{6}$/.test(localPincode)) {
            updatePincode(localPincode);
        } else {
            alert(t('chat.pincode_error'));
        }
    };

    const handleSubmit = async (e, voiceInput = null) => {
        if (e) e.preventDefault();
        const query = voiceInput || input;
        
        if (!query.trim()) return;
        if (!pincode.trim() || pincode.length !== 6) {
            alert(t('chat.pincode_error'));
            return;
        }

        const userMessage = { text: query, sender: 'user' };
        addMessageToChat(userMessage);
        setInput('');
        setIsAiTyping(true);

        try {
            const response = await api.postQuery({ query, language: i18n.language, pincode });
            const aiMessage = {
                sender: 'ai',
                text: response.response,
                confidence: response.confidence,
                sources: response.sources,
                weather: response.weather,
                market: response.market,
            };
            addMessageToChat(aiMessage);
        } catch (error) {
            console.error('Chat API error:', error);
            const errorMessage = { 
                text: t('chat.api_error'), 
                sender: 'ai' 
            };
            addMessageToChat(errorMessage);
        } finally {
            setIsAiTyping(false);
        }
    };

    return (
        <div className="w-full max-w-4xl flex flex-col flex-grow">
            {/* Pincode input */}
            <div className="mb-4 flex items-center space-x-2">
                <input
                    type="text"
                    value={localPincode}
                    onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, ''); // Only allow digits
                        setLocalPincode(value);
                    }}
                    className="flex-grow bg-white bg-opacity-80 border border-gray-300 rounded-full p-3 text-center focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder={t('chat.pincode_placeholder')}
                    maxLength="6"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSetPincode();
                        }
                    }}
                />
                <button
                    onClick={handleSetPincode}
                    className="bg-primary text-white rounded-full px-6 py-3 font-semibold hover:bg-primary-dark transition-colors"
                >
                    {t('chat.pincode_button')}
                </button>
            </div>

            {/* Chat message list */}
            <div className="flex-grow p-4 space-y-4 overflow-y-auto">
                {messages.map((msg, index) => (
                    <MessageBubble key={index} message={msg} />
                ))}
                {isAiTyping && <TypingIndicator />}
                <div ref={messagesEndRef} />
            </div>

            {/* Input form */}
            <form onSubmit={handleSubmit} className="p-4 bg-white bg-opacity-90 backdrop-blur-sm rounded-t-2xl shadow-lg flex items-center space-x-2">
                <button 
                    type="button" 
                    onClick={handleVoiceInput} 
                    className={`p-3 rounded-full text-white ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-secondary'}`}
                >
                    🎤
                </button>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-grow bg-gray-100 rounded-full p-3 px-5 focus:outline-none"
                    placeholder={t('chat.placeholder')}
                />
                <button type="submit" className="p-3 bg-primary text-white rounded-full">
                    ➤
                </button>
            </form>
        </div>
    );
};

export default ChatBox;