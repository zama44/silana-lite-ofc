import axios from 'axios';
import cheerio from 'cheerio';

async function selectSurah(link) { 
    let { data } = await axios.get(link);
    const $ = cheerio.load(data);
    const Result = [];
    const Isi = [];
    var surah = $('body > main > article > h1').text();
    var bismillah = $('body > main > article > p').text();
    
    $('body > main > article > ol > li:nth-child(n)').each((i, e) => {
        const arabic = $(e).find('p.arabic').text();
        const baca = $(e).find('p.translate').text();
        Isi.push({
            arabic,
            baca
        });
    });

    Result.push({ surah, bismillah }, Isi);
    return Result;
}

async function listsurah() {
    let { data } = await axios.get('https://litequran.net/');
    const $ = cheerio.load(data);
    const Result = [];
    
    $('body > main > ol > li:nth-child(n)').each((i, e) => {
        const name_surah = $(e).find('a').text();
        const link = 'https://litequran.net/' + $(e).find('a').attr('href');
        Result.push({
            link,
            name_surah,
        });
    });

    return Result;
}

async function getSurah(surahIndex) {
    const surahList = await listsurah();

    if (surahIndex < 1 || surahIndex > surahList.length) {
        return "🚫 *رقم السورة غير صحيح.* يرجى إدخال رقم صحيح.";
    }

    const selectedSurah = surahList[surahIndex - 1];
    const surahContent = await selectSurah(selectedSurah.link);

    let response = `📖 *سورة ${surahContent[0].surah}*\n`;
    response += `\n💠 *بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ*\n`;
    response += `${surahContent[0].bismillah}\n\n`;
    response += `🔹 *آيات السورة:*\n\n`;

    surahContent[1].forEach((ayah, index) => {
        response += `*📌 الآية ${index + 1}:*\n`;
        response += `📜 ${ayah.arabic}\n`;
        response += `🔹 ${ayah.baca}\n\n`;
    });

    response += `\n🤲 *نسأل الله أن ينير قلوبنا بنور كتابه الكريم.*\n`;

    return response;
}

let handler = async (m, { conn, text }) => {
    if (!text || isNaN(text)) {
        return conn.reply(m.chat, "⚠️ *الرجاء إدخال رقم السورة التي تريد البحث عنها.*", m);
    }

    let surahNumber = parseInt(text);
    let response = await getSurah(surahNumber);
    conn.reply(m.chat, response, m);
};

handler.help = ['surah'];
handler.tags = ['tools'];
handler.command = ['surah'];

export default handler;
