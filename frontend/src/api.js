import axios from 'axios';

// const API_URL = 'http://127.0.0.1:8000'; 
const API_URL = 'https://agrisaathi.onrender.com';

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

const handleApiError = (error) => {
    console.error("API Error:", error.response?.data?.detail || error.message);
    throw new Error(error.response?.data?.detail || "An unexpected error occurred.");
};

export const api = {
    postQuery: async (data) => {
        try {
            const response = await apiClient.post('/query', data);
            return response.data;
        } catch (error) {
            handleApiError(error);
        }
    },

    getWeather: async (pincode) => {
        try {
            const response = await apiClient.get(`/weather?pincode=${pincode}`);
            return response.data;
        } catch (error) {
            handleApiError(error);
        }
    },

    getMarketData: async (pincode) => {
        try {
            const response = await apiClient.get(`/market?pincode=${pincode}`);
            return response.data;
        } catch (error) {
            handleApiError(error);
        }
    },

    getSchemes: async () => {
        try {
            const response = await apiClient.get('/schemes');
            return response.data;
        } catch (error) {
            handleApiError(error);
        }
    },

    getLocationDetails: async (pincode) => {
        try {
            const response = await apiClient.get(`/location/${pincode}`);
            return response.data;
        } catch (error) {
            handleApiError(error);
        }
    },

    // Agri-Share Endpoints
    createEquipment: async (formData) => {
        try {
            // For file uploads, we use axios directly to let the browser set the Content-Type header.
            const response = await axios.post(`${API_URL}/agri-share/equipment`, formData);
            return response.data;
        } catch (error) {
            handleApiError(error);
        }
    },

    getEquipmentList: async (pincode = null) => {
        try {
            const url = pincode ? `/agri-share/equipment?pincode=${pincode}` : '/agri-share/equipment';
            const response = await apiClient.get(url);
            return response.data;
        } catch (error) {
            handleApiError(error);
        }
    },

    getEquipmentDetails: async (equipmentId) => {
        try {
            const response = await apiClient.get(`/agri-share/equipment/${equipmentId}`);
            return response.data;
        } catch (error) {
            handleApiError(error);
        }
    },

    createBooking: async (bookingData) => {
        try {
            const response = await apiClient.post('/agri-share/bookings', bookingData);
            return response.data;
        } catch (error) {
            handleApiError(error);
        }
    },

    getUserBookings: async (userId) => {
        try {
            const response = await apiClient.get(`/agri-share/bookings?user_id=${userId}`);
            return response.data;
        } catch (error) {
            handleApiError(error);
        }
    }
};
