import WebSocket from 'ws';
import axios from 'axios';

async function downloadImage(imageUrl) {
    try {
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        return Buffer.from(response.data);
    } catch (error) {
        throw new Error(`Failed to download image: ${error.message}`);
    }
}

async function sendImageToWebSocket(imageBuffer) {
    return new Promise((resolve, reject) => {
        const ws = new WebSocket('wss://screenshot-to-code-xe2d.onrender.com/generate-code');
        let collectedText = '';
        let finalCode = '';

        ws.on('open', () => {
            const base64Image = imageBuffer.toString('base64');
            const data = {
                generationType: "create",
                image: `data:image/jpeg;base64,${base64Image}`,
                inputMode: "image",
                openAiApiKey: null,
                openAiBaseURL: null,
                anthropicApiKey: null,
                screenshotOneApiKey: null,
                isImageGenerationEnabled: true,
                editorTheme: "cobalt",
                generatedCodeConfig: "html_tailwind",
                codeGenerationModel: "gpt-4o-2024-05-13",
                isTermOfServiceAccepted: false
            };
            ws.send(JSON.stringify(data));
        });

        ws.on('message', (message) => {
            const response = JSON.parse(message.toString());
            if (response.type === 'chunk') collectedText += response.value;
            if (response.type === 'setCode') finalCode = response.value;
        });

        ws.on('close', () => resolve({ 
            description: collectedText.trim(), 
            code: finalCode.trim() 
        }));

        ws.on('error', (error) => reject(error));
    });
}

const handler = async (m, { conn, text }) => {
    if (!text) return m.reply('❌ Please provide an image URL!\nExample: *.screenshot2code https://h.uguu.se/jwWKVnUU.jpg*');
    
    try {
        await m.reply('🔄 Processing image...');
        
        const imageBuffer = await downloadImage(text);
        const { description, code } = await sendImageToWebSocket(imageBuffer);
        
        await conn.sendMessage(m.chat, { 
            text: `📝 *Description:*\n${description}\n\n💻 *Generated Code:*\n${code}`,
            contextInfo: { mentionedJid: [m.sender] }
        }, { quoted: m });
        
    } catch (error) {
        console.error(error);
        m.reply(`❌ Error: ${error.message}`);
    }
};

handler.help = ['screenshot2code'];
handler.command = ['screenshot2code'];
handler.tags = ['tools'];
handler.limit = true;
export default handler;
