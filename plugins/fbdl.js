import fetch from 'node-fetch';

const handler = async (m, { text, conn }) => {
    if (!text) {
        return conn.sendMessage(m.chat, { text: '❌ يرجى إدخال رابط Facebook' }, { quoted: m });
    }

    // التحقق من صحة الرابط
    if (!text.includes('facebook.com') && !text.includes('fb.watch')) {
        return conn.sendMessage(m.chat, { text: '❌ الرابط غير صالح، يرجى إدخال رابط Facebook صحيح.' }, { quoted: m });
    }

    try {
        const response = await fetch(`https://api.vreden.web.id/api/fbdl?url=${encodeURIComponent(text)}`);
        const result = await response.json();

        if (!result?.data?.hd_url && !result?.data?.sd_url) {
            return conn.sendMessage(m.chat, { text: '⚠️ حدث خطأ أثناء جلب الفيديو. تأكد من صحة الرابط وحاول مجددًا.' }, { quoted: m });
        }

        const { hd_url, sd_url, title = 'بدون عنوان', durasi = 'غير معروف' } = result.data;
        const videoUrl = hd_url || sd_url;

        await conn.sendMessage(
            m.chat,
            {
                video: { url: videoUrl },
                caption: `🎥 *العنوان:* ${title}\n⏳ *المدة:* ${durasi}`,
            },
            { quoted: m }
        );

    } catch (error) {
        console.error(error);
        conn.sendMessage(m.chat, { text: '❌ حدث خطأ أثناء تحميل الفيديو، يرجى المحاولة لاحقًا.' }, { quoted: m });
    }
};

handler.help = ['fbdl'];
handler.tags = ['downloader'];
handler.command = ['fbdl'];

export default handler;
