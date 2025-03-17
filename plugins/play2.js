import axios from 'axios';

let handler = async (m, { text, command }) => {
    if (!text) return m.reply(`❌ مثال الاستخدام: ${command} senorita`);

    m.reply('🔍 جاري البحث عن الأغنية، يرجى الانتظار...');

    try {
        let searchUrl = `http://kinchan.sytes.net/ytdl/search?text=${encodeURIComponent(text)}`;
        let searchResponse = await axios.get(searchUrl);
        let video = searchResponse.data;

        if (!video || !video.videoId) {
            return m.reply('❌ لم يتم العثور على الأغنية.');
        }

        let videoId = video.videoId;
        let title = video.title;
        let url = `https://youtube.com/watch?v=${videoId}`;

        const thumbnails = await axios.get(video.thumbnail, { responseType: 'arraybuffer' });
        const thumbnail = Buffer.from(thumbnails.data, 'binary');

        let downloadUrl = `http://kinchan.sytes.net/yt/downloader?url=${url}&formatId=audio-only&formatExt=mp3`;
        let downloadResponse = await axios.get(downloadUrl);
        let downloadResult = downloadResponse.data;

        if (!downloadResult || !downloadResult.downloadLink) {
            return m.reply('❌ فشل تنزيل الأغنية.');
        }

        let audioUrl = downloadResult.downloadLink;

        await conn.sendMessage(m.chat, {
            audio: { url: audioUrl },
            mimetype: 'audio/mp4',
            fileName: `${title}.mp3`,
            contextInfo: {
                isForwarded: true,
                forwardingScore: 99999,
                externalAdReply: {
                    showAdAttribution: true,
                    mediaType: 2,
                    previewType: 2,
                    mediaUrl: url,
                    title: title,
                    body: `عدد المشاهدات: ${video.views} | المدة: ${video.timestamp}`,
                    sourceUrl: url,
                    thumbnail: thumbnail,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: m });

    } catch (error) {
        console.error(error);
        m.reply('❌ حدث خطأ أثناء معالجة الطلب.');
    }
};

handler.help = handler.command = ['play2'];
handler.tags = ['downloader'];
export default handler;
