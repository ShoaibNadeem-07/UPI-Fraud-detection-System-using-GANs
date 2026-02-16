import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Health check
export const checkHealth = async () => {
    const response = await api.get('/');
    return response.data;
};

// Single prediction (dataset mode)
export const predictFraud = async (features) => {
    const response = await api.post('/predict', {
        mode: 'dataset',
        features
    });
    return response.data;
};

// UPI transaction prediction
export const predictUPIFraud = async (senderUpi, recipientUpi, amount) => {
    const response = await api.post('/predict', {
        mode: 'upi',
        sender_upi: senderUpi,
        recipient_upi: recipientUpi,
        amount: parseFloat(amount)
    });
    return response.data;
};

// Analyze dataset (file upload)
export const analyzeDataset = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/analyze-dataset', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

// Submit feedback
export const submitFeedback = async (transactionId, feedback, actualFraud) => {
    const response = await api.post('/feedback', {
        transaction_id: transactionId,
        feedback,
        actual_fraud: actualFraud
    });
    return response.data;
};

// Get alerts
export const getAlerts = async () => {
    const response = await api.get('/alerts');
    return response.data;
};

export default api;
