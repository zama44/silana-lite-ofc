import axios from 'axios';
import cheerio from 'cheerio';

async function getMod(query) {
    try {
        const url = `https://happymod.com/search.html?q=${query}`;
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        let result = [];

        $(".pdt-app-box").each((_, el) => {
            const title = $(el).find("h3").text().trim();
            const link = "https://happymod.com" + $(el).find('a').attr('href');
            const rating = $(el).find("span.a-search-num").text().trim();

            result.push({ title, link, rating });
        });

        return result;
    } catch (e) {
        console.error(e);
        return [];
    }
}

let handler = async (m, { conn, text }) => {
    if (!text) return m.reply('Please enter the app name.\n\n*Example:* .hmod Minecraft');
    
    m.react("⌛");

    try {
        const data = await getMod(text);

        if (data.length === 0) {
            m.react("❌");
            return m.reply('No results found.');
        }

        let message = `*Happymod Search Results*\n\n`;

        for (let i = 0; i < Math.min(data.length, 15); i++) {
            message += `*${i + 1}. ${data[i].title}*\n`;
            message += `⭐ Rating: ${data[i].rating}\n`;
            message += `🔗 Link: ${data[i].link}\n\n`;
        }

        await conn.sendMessage(m.chat, { 
            image: { url: "https://i.postimg.cc/c6q7zRC8/1741529921037.png" }, 
            caption: message 
        });

        m.react("✅");
    } catch (error) {
        console.error(error);
        m.react("❌");
        m.reply('An error occurred while fetching data.');
    }
};

handler.help = ['happymodsearch'];
handler.command = ['happymodsearch'];
handler.tags = ['search'];

export default handler;
