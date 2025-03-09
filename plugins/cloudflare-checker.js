import axios from "axios";

let handler = async (m, { conn, text }) => {
    if (!text) return m.reply("🚨 *يرجى إدخال رابط الموقع!*");

    try {
        let body = new URLSearchParams({ domain: text });
        let { data } = await axios.post("https://checkforcloudflare.selesti.com/api.php", body, {
            headers: {
                "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                "origin": "https://checkforcloudflare.selesti.com",
                "referer": "https://checkforcloudflare.selesti.com/",
                "user-agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36"
            }
        });

        await conn.sendMessage(m.chat, { text: `🔍 *نتائج فحص Cloudflare لموقع: ${text}*\n\n${JSON.stringify(data, null, 2)}` }, { quoted: m });
    } catch (error) {
        console.error(error);
        m.reply("❌ *حدث خطأ أثناء فحص الموقع. حاول مجددًا لاحقًا!*");
    }
};

handler.help = ["cloudflare-checker"];
handler.tags = ["tools"];
handler.command = /^(cloudflare-checker)$/i;

export default handler;
