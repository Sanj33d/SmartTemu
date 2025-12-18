const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Sends a message to the chatbot and returns the AI response
 * @param {string} message - The user's message
 * @returns {Promise<Object>} - The chatbot response data
 */
const sendChatMessage = async (message) => {
  try {
    const response = await fetch(`${API_BASE_URL}/chatbot/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to get chatbot response');
    }

    return data;
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
};

export { sendChatMessage };

