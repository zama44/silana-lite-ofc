const handler = async (m, { conn, text, usedPrefix, command }) => {
    try {
        const [url, resolution] = text ? text.split(' ') : [];
        if (!url || !isValidUrl(url)) {
            return conn.reply(m.chat, `Use the format: ${usedPrefix}${command} <url> [resolution]\nExample: \n\n${usedPrefix}${command} https://youtube.com/shorts/Y_RmBBVkAiE?si=J1Cj65v9pF_37Cba 720`, m);
        }

        const usedResolution = resolution || '480p'; // Default resolution if not provided
        const videoBuffer = await fetchVideoDownload(url, usedResolution);

        if (!videoBuffer) return conn.reply(m.chat, 'Failed to download video.', m);

        const videoSize = videoBuffer.length / (1024 * 1024); // File size in MB
        const fileName = `تابعني صانعي في الانستغرام : \ninstagram.com/noureddine_ouafy`; // Unique file name based on timestamp

        const message = `
الفيديو قااادم انتظر
`;

        await conn.reply(m.chat, message, m);

        // Send video to user
        if (videoSize > 100) {
            await conn.sendMessage(m.chat, {
                document: videoBuffer,
                mimetype: 'video/mp4',
                fileName: fileName,
            });
        } else {
            await conn.sendMessage(m.chat, {
                video: videoBuffer,
                caption: fileName,
                mimetype: 'video/mp4',
            });
        }
    } catch (error) {
        console.error('An error occurred:', error);
        conn.reply(m.chat, 'An error occurred while processing your request.', m);
    }
};

const isValidUrl = (url) => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

const fetchVideoDownload = async (url, resolution) => {
    try {
        const res = await fetch(`http://ytdlpyton.nvlgroup.my.id/download/?url=${url}&resolution=${resolution}`);
        if (!res.ok) throw new Error('Failed to download video.');
        return await res.buffer();
    } catch (error) {
        console.error(error);
        return null;
    }
};

handler.help = ['youtube'];
handler.command = ['youtube'];
handler.tags = ['downloader'];
handler.limit = true
export default handler;
