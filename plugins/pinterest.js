import axios from "axios";
import cheerio from "cheerio";

const base = "https://www.pinterest.com";
const search = "/resource/BaseSearchResource/get/";

const headers = {
    'accept': 'application/json, text/javascript, */*, q=0.01',
    'referer': 'https://www.pinterest.com/',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
    'x-app-version': 'a9522f',
    'x-pinterest-appstate': 'active',
    'x-pinterest-pws-handler': 'www/[username]/[slug].js',
    'x-requested-with': 'XMLHttpRequest'
};

async function getCookies() {
    try {
        const response = await axios.get(base);
        const setHeaders = response.headers['set-cookie'];
        if (setHeaders) {
            const cookies = setHeaders.map(cookieString => cookieString.split(';')[0].trim()).join('; ');
            return cookies;
        }
        return null;
    } catch (error) {
        console.error("خطأ أثناء جلب الكوكيز:", error);
        return null;
    }
}

async function searchPinterest(query) {
    if (!query) {
        return { status: false, message: "يرجى إدخال كلمة بحث صحيحة!" };
    }

    try {
        const cookies = await getCookies();
        if (!cookies) {
            return { status: false, message: "فشل في استرجاع الكوكيز، حاول مرة أخرى لاحقًا." };
        }

        const params = {
            source_url: `/search/pins/?q=${query}`,
            data: JSON.stringify({
                options: { isPrefetch: false, query, scope: "pins", bookmarks: [""], page_size: 10 },
                context: {}
            }),
            _: Date.now()
        };

        const { data } = await axios.get(`${base}${search}`, { headers: { ...headers, 'cookie': cookies }, params });

        const results = data.resource_response.data.results.filter(v => v.images?.orig);
        if (results.length === 0) {
            return { status: false, message: `لم يتم العثور على نتائج لكلمة البحث: ${query}` };
        }

        return {
            status: true,
            pins: results.map(result => ({
                id: result.id,
                title: result.title || "بدون عنوان",
                description: result.description || "بدون وصف",
                pin_url: `https://pinterest.com/pin/${result.id}`,
                image: result.images.orig.url,
                uploader: {
                    username: result.pinner.username,
                    full_name: result.pinner.full_name,
                    profile_url: `https://pinterest.com/${result.pinner.username}`
                }
            }))
        };

    } catch (error) {
        return { status: false, message: "حدث خطأ أثناء البحث، حاول مرة أخرى لاحقًا." };
    }
}

let handler = async (m, { conn, text }) => {
    if (!text) {
        return conn.reply(m.chat, "❌ *يرجى إدخال كلمة بحث!*\nمثال: .pinterest قطة", m);
    }

    let result = await searchPinterest(text);
    if (!result.status) {
        return conn.reply(m.chat, `⚠️ ${result.message}`, m);
    }

    for (let pin of result.pins) {
        await conn.sendMessage(m.chat, { image: { url: pin.image }, caption: `📌 *${pin.title}*\n🔗 رابط: ${pin.pin_url}\n👤 الناشر: ${pin.uploader.full_name} (@${pin.uploader.username})` }, { quoted: m });
    }
};

handler.help = ['pinterest'];
handler.tags = ['downloader'];
handler.command = ['pinterest'];

export default handler;
