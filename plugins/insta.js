import https from 'https';
import cheerio from 'cheerio';

async function downloadGram(urlInsta) {
    const payload = new URLSearchParams();
    payload.append('url', urlInsta);

    const requestData = {
        hostname: 'api.downloadgram.app',
        path: '/media',
        method: 'POST',
        headers: {
            'accept-language': 'id-ID',
            'content-length': payload.toString().length,
            'content-type': 'application/x-www-form-urlencoded',
            'origin': 'https://downloadgram.app',
            'priority': 'u=0',
            'referer': 'https://downloadgram.app/',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-site',
            'te': 'trailers',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(requestData, (res) => {
            let responseData = '';
            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                const $ = cheerio.load(responseData);
                const resultData = {};

                const videoElement = $('div.download-items');
                if (videoElement.length > 0) {
                    resultData.urlVideo = videoElement.find('video').attr('src');
                    resultData.urlButton = videoElement.find('a').attr('href');
                } else {
                    const imageElement = $('img');
                    if (imageElement.length > 0) {
                        resultData.thumb = imageElement.attr('src');
                        resultData.video = $('a').attr('href');
                    }
                }

                Object.keys(resultData).forEach((i) => {
                    if (resultData[i]) {
                        resultData[i] = resultData[i].replace(/\\\\"/g, '').replace(/\\"/g, '');
                    }
                });

                resolve(resultData);
            });
        });

        req.on('error', (error) => {
            console.log(error);
            reject(error.message);
        });

        req.write(payload.toString());
        req.end();
    });
}

let handler = async (m, { conn, args }) => {
    if (!args[0]) return m.reply('المرجو إدخال رابط فيديو من إنستغرام.');

    try {
        const result = await downloadGram(args[0]);
        if (result.urlVideo) {
            await conn.sendMessage(m.chat, { video: { url: result.urlVideo }, caption: 'تم تحميل الفيديو بنجاح ✅' }, { quoted: m });
        } else if (result.thumb) {
            await conn.sendMessage(m.chat, { image: { url: result.thumb }, caption: 'تم تحميل الصورة بنجاح ✅' }, { quoted: m });
        } else {
            m.reply('عذرًا، لم أتمكن من تحميل المحتوى. تأكد من صحة الرابط.');
        }
    } catch (error) {
        m.reply('حدث خطأ أثناء محاولة التحميل. حاول مرة أخرى لاحقًا.');
    }
};

handler.help = ['insta'];
handler.tags = ['downloader'];
handler.command = /^insta(dl)?$/i;

export default handler;
