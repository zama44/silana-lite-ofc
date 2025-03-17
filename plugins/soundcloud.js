import axios from 'axios';
import * as cheerio from 'cheerio';

let handler = async (m, { conn, args }) => {
    if (!args[0]) return conn.reply(m.chat, "Use the format: .soundcloud <song title>", m);
    conn.sendMessage(m.chat, { react: { text: "🕒", key: m.key } });

    try {
        let results = await SoundCloudSearch(args.join(" "));
        if (!results.length) return conn.reply(m.chat, "No results found.", m);

        let track = results[0];
        let downloadData = await SoundCloudDownload(track.link);

        if (!downloadData) return conn.reply(m.chat, "Failed to retrieve the download link.", m);

        let message = `🎵 *Title:* ${downloadData.title}\n🔗 *Link:* ${track.link}\n\n> Downloading audio...`;

        await conn.sendMessage(m.chat, {
            image: { url: downloadData.thumbnail },
            caption: message
        }, { quoted: m });

        await conn.sendMessage(m.chat, {
            audio: { url: downloadData.downloadUrl },
            mimetype: "audio/mp4"
        }, { quoted: m });

    } catch (error) {
        console.error("SoundCloud Error:", error);
        conn.reply(m.chat, "An error occurred, please try again later.", m);
    }
};

handler.help = ["soundcloud"];
handler.tags = ["downloader"];
handler.command = /^(soundcloud|scsearch)$/i;

export default handler;

async function SoundCloudSearch(query) {
    try {
        const { data } = await axios.get(`https://soundcloud.com/search?q=${encodeURIComponent(query)}`);
        const $ = cheerio.load(data);
        const noscriptContent = [];

        $('#app > noscript').each((_, el) => noscriptContent.push($(el).html()));

        if (noscriptContent.length < 2) throw new Error("Data not found");

        const _$ = cheerio.load(noscriptContent[1]);
        const results = [];

        _$('ul > li > h2 > a').each((_, el) => {
            const link = $(el).attr('href');
            const title = $(el).text();

            if (link && link.split('/').length === 3) {
                results.push({
                    title: title || "No Title",
                    link: `https://soundcloud.com${link}`
                });
            }
        });

        return results.length ? results : [];
    } catch {
        return [];
    }
}

async function SoundCloudDownload(url) {
    try {
        const { data } = await axios.get(`https://api.siputzx.my.id/api/d/soundcloud?url=${encodeURIComponent(url)}`);
        if (!data?.data?.url) throw new Error("Failed to retrieve the download link.");

        return {
            title: data.data.title || "No Title",
            thumbnail: data.data.thumbnail || "",
            downloadUrl: data.data.url
        };
    } catch {
        return null;
    }
          }
