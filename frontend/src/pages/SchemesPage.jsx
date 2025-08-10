import React, { useState, useEffect } from 'react';
import { api } from '../api';

const SchemesPage = () => {
    const [schemes, setSchemes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchSchemes = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await api.getSchemes();
                setSchemes(response.schemes || []);
            } catch (err) {
                setError(err.message || 'Failed to fetch schemes.');
            } finally {
                setLoading(false);
            }
        };

        fetchSchemes();
    }, []);

    return (
        <div className="w-full max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Government Schemes for Agriculture</h1>

            {loading && <p>Loading schemes...</p>}
            {error && <p className="text-red-500 bg-red-100 p-3 rounded-lg">{error}</p>}
            
            {!loading && schemes.length === 0 && !error && (
                <p className="text-center text-gray-500 mt-8">No schemes found.</p>
            )}

            {schemes.length > 0 && (
                <div className="space-y-4">
                    {schemes.map((scheme, index) => (
                        <div key={index} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                            <div className="flex justify-between items-start">
                                <h2 className="text-xl font-bold text-primary mb-2">{scheme.scheme_name}</h2>
                                {scheme.category && (
                                    <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                                        {scheme.category}
                                    </span>
                                )}
                            </div>
                            <p className="text-gray-600">{scheme.description}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SchemesPage;
