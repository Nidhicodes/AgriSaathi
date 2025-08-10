import React from 'react';

const SampleQuestions = ({ questions, onQuestionClick }) => {
    if (!questions || questions.length === 0) {
        return null;
    }

    return (
        <div className="flex flex-wrap justify-center gap-2 my-4">
            {questions.map((q, i) => (
                <button
                    key={i}
                    onClick={() => onQuestionClick(q)}
                    className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full border border-green-200 hover:bg-green-200 transition-colors"
                >
                    {q}
                </button>
            ))}
        </div>
    );
};

export default SampleQuestions;
