import axios from 'axios';

async function handler(m, { conn, text }) {
    if (!text) return m.reply("Please enter the name of the APK you are looking for.");
    
    try {
        const search = await axios.get(`https://api.koboo.my.id/api/search/apk?query=${text}`);
        const { result } = search.data;

        if (!result || result.length === 0) {
            return m.reply(`No APK found with the name "${text}".`);
        }

        const download = await axios.get(`https://api.koboo.my.id/api/download/apk?slug=${result[0].slug}`);
        const { title, version, download: downloadLink, author, score, unduhan } = download.data.result;

        const caption = `
📌 *Title:* ${title}
🔢 *Version:* ${version}
👤 *Author:* ${author}
⭐ *Score:* ${score}
⬇️ *Downloads:* ${unduhan}
        `;

        await conn.sendMessage(m.chat, {
            document: { url: downloadLink.url },
            mimetype: "application/vnd.android.package-archive",
            fileName: `${title}.apk`,
            caption
        }, { quoted: m });

    } catch (error) {
        console.error(error);
        m.reply("An error occurred while downloading the APK.");
    }
}

handler.command = ["apkdl"];
handler.tags = ["downloader"];
handler.help = ["apkdl"];
handler.limit = true;
handler.register = false;

export default handler;
