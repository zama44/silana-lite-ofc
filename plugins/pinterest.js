import axios from "axios";
import cheerio from "cheerio";
import moment from "moment-timezone";

class Pinterest {
    async search(query) {
        const queryParams = {
            source_url: "/search/pins/?q=" + encodeURIComponent(query),
            data: JSON.stringify({
                options: {
                    isPrefetch: false,
                    query: query,
                    scope: "pins",
                    no_fetch_context_on_resource: false,
                },
                context: {},
            }),
            _: Date.now(),
        };
        let url = new URL("https://www.pinterest.com/resource/BaseSearchResource/get/");
        Object.entries(queryParams).forEach(([key, value]) => url.searchParams.set(key, value));

        try {
            const response = await fetch(url.toString());
            const json = await response.json();
            return json.resource_response.data.results
                .filter((a) => a.title !== "")
                .map((a) => ({
                    title: a.title,
                    id: a.id,
                    created_at: moment(new Date(a.created_at) * 1).format("DD/MM/YYYY HH:mm:ss"),
                    author: a.pinner.username,
                    followers: a.pinner.follower_count.toLocaleString(),
                    source: "https://www.pinterest.com/pin/" + a.id,
                    image: a.images["orig"].url,
                }));
        } catch (error) {
            console.error("Error fetching data:", error);
            return [];
        }
    }

    async download(url) {
        try {
            const response = await axios.get(url, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
                },
            });
            const $ = cheerio.load(response.data);
            const tag = $('script[data-test-id="video-snippet"]');

            if (tag.length > 0) {
                const result = JSON.parse(tag.text());
                if (!result || !result.name || !result.thumbnailUrl || !result.uploadDate || !result.creator) {
                    return { msg: "Data not found, try another URL." };
                }
                return {
                    title: result.name,
                    thumb: result.thumbnailUrl,
                    upload: new Date(result.uploadDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "numeric",
                        minute: "numeric",
                        second: "numeric",
                    }),
                    source: result["@id"],
                    author: {
                        name: result.creator.alternateName,
                        username: "@" + result.creator.name,
                        url: result.creator.url,
                    },
                    keyword: result.keywords ? result.keywords.split(", ").map((keyword) => keyword.trim()) : [],
                    download: result.contentUrl,
                };
            } else {
                const json = JSON.parse($("script[data-relay-response='true']").eq(0).text());
                const result = json.response.data["v3GetPinQuery"].data;
                return {
                    title: result.title,
                    upload: new Date(result.createAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "numeric",
                        minute: "numeric",
                        second: "numeric",
                    }),
                    source: result.link,
                    author: {
                        name: result.pinner.username,
                        username: "@" + result.pinner.username,
                    },
                    keyword: result.pinJoin.visualAnnotation,
                    download: result.imageLargeUrl,
                };
            }
        } catch (e) {
            return { msg: "Error, please try again later." };
        }
    }
}

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`*Example:* ${usedPrefix + command} anime`);
    const pin = new Pinterest();

    if (text.includes('pin.it') || text.includes('pinterest.com')) {
        try {
            m.reply('*[System Notice]* Pinterest URL detected! Downloading...');
            const response = await pin.download(text);

            if (response.download) {
                let caption = `*P I N T E R E S T - D O W N L O A D E R*\n\n   ◦ Title: ${response.title}\n   ◦ Author: ${response.author.name}`;
                await conn.sendFile(m.chat, response.download, '', caption, m);
            } else {
                conn.reply(m.chat, response.msg || "Media not found!", m);
            }
        } catch (e) {
            console.log(e);
            m.reply(e.message);
        }
        return;
    }

    try {
        let results = await pin.search(text);
        if (!results.length) throw `*[System Notice]* No results found!`;

        let result = results[0];
        let caption = `*P I N T E R E S T - S E A R C H*\n\n   ◦ Title: ${result.title}\n   ◦ ID: ${result.id}\n   ◦ Created At: ${result.created_at}\n   ◦ Author: ${result.author}\n   ◦ Source: ${result.source}`;
        await conn.sendFile(m.chat, result.image, '', caption, m);
    } catch (e) {
        console.log(e);
        m.reply(e.message);
    }
};

handler.help = ['pinterest']
handler.tags = ['downloader'];
handler.command = /^(pinterest)$/i;
handler.limit = 3;
export default handler;
