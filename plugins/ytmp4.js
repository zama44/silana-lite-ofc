import fetch from 'node-fetch';
import axios from 'axios';

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) throw `Usage: ${usedPrefix}${command} <YouTube URL>\nExample: ${usedPrefix}${command} https://youtube.com/watch?v=wjK4_sBuNAM`;

    try {
        const { data } = await axios.get(`https://ytdl-api.caliphdev.com/download/video?url=${encodeURIComponent(text)}`);
        
        if (!data?.status) throw 'Failed to download video. Please ensure the URL is valid.';

        const {
            videoDetails: { title, cover, lengthSeconds },
            downloadUrl
        } = data;

        if (!downloadUrl) throw 'Download link not found.';

        const caption = `
🎬 *YouTube MP4 Downloader* 🎬
    
📌 *Title*  : ${title || 'Not available'}
⏳ *Duration* : ${lengthSeconds ? `${lengthSeconds} seconds` : 'Not available'}
📥 *Downloading video...*
`;

        await conn.sendMessage(m.chat, {
            text: caption,
            contextInfo: {
                externalAdReply: {
                    title: title || 'Title not available',
                    body: 'Downloading video...',
                    thumbnailUrl: cover || '',
                },
            },
        });

        const videoBuffer = await fetch(downloadUrl).then(res => res.buffer());
        await conn.sendMessage(m.chat, { video: videoBuffer, mimetype: 'video/mp4', fileName: `${title}.mp4` }, { quoted: m });
    } catch (e) {
        console.error(e);
        m.reply('An error occurred while downloading the video. Please try again later.');
    }
};

handler.help = ['ytmp4']
handler.tags = ['downloader'];
handler.command = /^(ytmp4)$/i;

export default handler;
