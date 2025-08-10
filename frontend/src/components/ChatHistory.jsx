import React from 'react';
import { useAppContext } from '../context/AppContext';

const ChatHistory = ({ isSidebarOpen, setIsSidebarOpen }) => {
    const { chats, activeChatId, setActiveChatId, startNewChat } = useAppContext();

    const sidebarClasses = `
        fixed top-0 left-0 h-full w-64 bg-gray-100 p-4 border-r border-gray-200 flex flex-col
        transform transition-transform duration-300 ease-in-out z-30
        md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
    `;

    return (
        <>
            {/* Overlay for mobile */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            <div className={sidebarClasses}>
                <button
                    onClick={startNewChat}
                    className="w-full bg-primary text-white font-semibold py-2 px-4 rounded-lg hover:bg-primary-dark transition-colors mb-4"
                >
                    + New Chat
                </button>
                <div className="flex-grow overflow-y-auto">
                    <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">History</h2>
                    <ul className="space-y-2">
                        {chats.map((chat) => (
                            <li key={chat.id}>
                                <button
                                    onClick={() => {
                                        setActiveChatId(chat.id);
                                        setIsSidebarOpen(false);
                                    }}
                                    className={`w-full text-left p-2 rounded-md truncate ${
                                        activeChatId === chat.id
                                            ? 'bg-primary-light text-white'
                                            : 'hover:bg-gray-200'
                                    }`}
                                >
                                    {chat.messages[1]?.text || chat.messages[0]?.text || 'New Chat'}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </>
    );
};

export default ChatHistory;
