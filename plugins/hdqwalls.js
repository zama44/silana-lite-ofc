import axios from 'axios'
import cheerio from 'cheerio'

let handler = async (m, { conn, text }) => {
    if (!text) return conn.reply(m.chat, 'Please specify a search term!', m)

    const q = text.trim();
    const anu = `https://hdqwalls.com/search?q=${q}`;
    const { data } = await axios.get(anu);
    const $ = cheerio.load(data);

    let result = [];

    $('.wall-resp.col-lg-4.col-md-4.col-sm-4.col-xs-6.column_padding').each((i, el) => {
        const title = $(el).find('a').text().trim();
        const imgSrc = $(el).find('a').attr('href');

        result.push({
            status: true,
            title,
            imgSrc
        });
    });

    if (result.length === 0) {
        return conn.reply(m.chat, 'No wallpapers found for this search term.', m)
    }

    let message = 'Here are the results:\n\n';
    result.forEach((item, index) => {
        message += `${index + 1}. ${item.title}\n${item.imgSrc}\n\n`;
    });

    conn.reply(m.chat, message, m);
}

handler.help = handler.command = ['hdqwalls']
handler.tags = ['search']

export default handler
