import axios from 'axios';

async function spotidown(url) {
    try {
        console.log(`🔍 Fetching data from: ${url}`);

        const response = await axios.post('https://spotymate.com/api/download-track',
            { url: url },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36',
                    'Referer': 'https://spotymate.com/'
                }
            }
        );

        if (response.data && response.data.file_url) {
            return {
                status: true,
                file_url: response.data.file_url
            };
        } else {
            return {
                status: false,
                message: '❌ Tidak dapat menemukan link unduhan!'
            };
        }
    } catch (error) {
        return {
            status: false,
            message: `❌ Error: ${error.message}`
        };
    }
}

let handler = async (m, { conn, args }) => {
    if (!args[0]) return m.reply('❌ يرجى إدخال رابط Spotify!');

    let result = await spotidown(args[0]);

    if (result.status) {
        await conn.sendMessage(m.chat, { audio: { url: result.file_url }, mimetype: 'audio/mpeg' }, { quoted: m });
    } else {
        m.reply(result.message);
    }
};

handler.help = ['spotify'];
handler.tags = ['downloader'];
handler.command = ['spotify'];

export default handler;
