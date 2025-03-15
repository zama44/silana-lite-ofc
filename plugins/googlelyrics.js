import fetch from 'node-fetch';
import cheerio from 'cheerio';

async function googleLyrics(judulLagu) {
  try {
    const response = await fetch(`https://r.jina.ai/https://www.google.com/search?q=lirik+lagu+${encodeURIComponent(judulLagu)}&hl=en`, {
      headers: {
        'x-return-format': 'html',
        'x-engine': 'cf-browser-rendering',
      }
    });

    const text = await response.text();
    const $ = cheerio.load(text);
    const lirik = [];
    const output = [];
    const result = {};

    $('div.PZPZlf').each((i, e) => {
      const penemu = $(e).find('div[jsname="U8S5sf"]').text().trim();
      if (!penemu) output.push($(e).text().trim());
    });

    $('div[jsname="U8S5sf"]').each((i, el) => {
      let out = '';
      $(el).find('span[jsname="YS01Ge"]').each((j, span) => {
        out += $(span).text() + '\n';
      });
      lirik.push(out.trim());
    });

    result.lyrics = lirik.join('\n\n');
    result.title = output.shift();
    result.subtitle = output.shift();
    result.platform = output.filter(_ => !_.includes(':'));

    output.forEach(_ => {
      if (_.includes(':')) {
        const [name, value] = _.split(':');
        result[name.toLowerCase()] = value.trim();
      }
    });

    return result;
  } catch (error) {
    return { error: error.message };
  }
}

let handler = async (m, { conn, args }) => {
  if (!args[0]) return m.reply('🚫 يرجى إدخال اسم الأغنية للبحث عن كلماتها!');

  let query = args.join(' ');
  m.reply(`🔎 يتم البحث عن كلمات أغنية: *${query}*...`);

  let result = await googleLyrics(query);

  if (result.error) {
    return m.reply(`❌ حدث خطأ أثناء البحث:\n${result.error}`);
  }

  let message = `🎵 *${result.title || 'غير معروف'}*\n📌 ${result.subtitle || 'غير معروف'}\n\n📖 *كلمات الأغنية:*\n${result.lyrics || 'غير متوفرة'}\n\n📡 *المصدر:* Google`;

  await conn.sendMessage(m.chat, { text: message }, { quoted: m });
};

handler.help = ['googlelyrics'];
handler.command = ['googlelyrics'];
handler.tags = ['tools'];

export default handler;
