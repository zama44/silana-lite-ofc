import fetch from 'node-fetch';

const handler = async (m, { text }) => {
    // Ensure the text input is provided
    if (!text) {
        return m.reply('❌ Please provide text for AI!');
    }

    try {
        // Send the text to the API
        const response = await fetch(`https://api.ryzendesu.vip/api/ai/claude?text=${encodeURIComponent(text)}`);
        
        // Check if the response is OK
        if (!response.ok) {
            throw new Error('Failed to connect to the API.');
        }

        // Convert the response to JSON
        const result = await response.json();

        // Check if the API response contains the expected result
        if (!result || !result.response) {
            throw new Error('Failed to get a response from the API.');
        }

        // Reply with the AI response
        m.reply(result.response);

    } catch (error) {
        // Log any errors that occur
        console.error(error);
        
        // Reply with an error message
        m.reply('❌ There was an error in processing your request. Please try again later.');
    }
};

// Command and metadata
handler.help = ['claude'];
handler.tags = ['ai'];
handler.command = ['aiclaude'];

export default handler;
