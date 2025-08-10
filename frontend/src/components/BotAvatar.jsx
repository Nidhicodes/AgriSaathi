import React from 'react';
import { motion } from 'framer-motion';

const BotAvatar = () => {
    return (
        <motion.div
            animate={{
                scale: [1, 1.1, 1, 1.1, 1],
                rotate: [0, 10, -10, 10, 0],
            }}
            transition={{
                duration: 2,
                ease: "easeInOut",
                times: [0, 0.2, 0.5, 0.8, 1],
                repeat: Infinity,
                repeatDelay: 1
            }}
            className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold text-lg"
        >
            A
        </motion.div>
    );
};

export default BotAvatar;
