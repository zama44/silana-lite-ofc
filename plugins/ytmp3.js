import axios from 'axios';
import crypto from 'crypto';

const savetube = {
  api: {
    base: "https://media.savetube.me/api",
    cdn: "/random-cdn",
    info: "/v2/info", 
    download: "/download"
  },
  headers: {
    'accept': '*/*',
    'content-type': 'application/json',
    'origin': 'https://yt.savetube.me',
    'referer': 'https://yt.savetube.me/',
    'user-agent': 'Postify/1.0.0'
  },
  formats: ['mp3'],

  crypto: {
    hexToBuffer: (hexString) => {
      return Buffer.from(hexString.match(/.{1,2}/g).join(''), 'hex');
    },

    decrypt: async (enc) => {
      try {
        const secretKey = 'C5D58EF67A7584E4A29F6C35BBC4EB12';
        const data = Buffer.from(enc, 'base64');
        const iv = data.slice(0, 16);
        const content = data.slice(16);
        const key = savetube.crypto.hexToBuffer(secretKey);
        
        const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
        let decrypted = decipher.update(content);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        
        return JSON.parse(decrypted.toString());
      } catch (error) {
        throw new Error(`${error.message}`);
      }
    }
  },
  youtube: url => {
    if (!url) return null;
    const patterns = [
      /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
      /youtu\.be\/([a-zA-Z0-9_-]{11})/
    ];
    for (let pattern of patterns) {
      if (pattern.test(url)) return url.match(pattern)[1];
    }
    return null;
  },

  request: async (endpoint, data = {}, method = 'post') => {
    try {
      const { data: response } = await axios({
        method,
        url: `${endpoint.startsWith('http') ? '' : savetube.api.base}${endpoint}`,
        data: method === 'post' ? data : undefined,
        params: method === 'get' ? data : undefined,
        headers: savetube.headers
      });
      return { status: true, code: 200, data: response };
    } catch (error) {
      return { status: false, code: error.response?.status || 500, error: error.message };
    }
  },

  getCDN: async () => {
    const response = await savetube.request(savetube.api.cdn, {}, 'get');
    return response.status ? { status: true, code: 200, data: response.data.cdn } : response;
  },

  download: async (link) => {
    if (!link) return { status: false, code: 400, error: "الرجاء إدخال رابط اليوتيوب." };

    const id = savetube.youtube(link);
    if (!id) return { status: false, code: 400, error: "الرابط غير صحيح، تأكد من أنه رابط يوتيوب صالح." };

    try {
      const cdnx = await savetube.getCDN();
      if (!cdnx.status) return cdnx;
      const cdn = cdnx.data;

      const result = await savetube.request(`https://${cdn}${savetube.api.info}`, { url: `https://www.youtube.com/watch?v=${id}` });
      if (!result.status) return result;
      const decrypted = await savetube.crypto.decrypt(result.data.data);

      const dl = await savetube.request(`https://${cdn}${savetube.api.download}`, {
        id, downloadType: 'audio', quality: '128', key: decrypted.key
      });

      return {
        status: true,
        code: 200,
        result: {
          title: decrypted.title || "عنوان غير معروف",
          format: 'mp3',
          thumbnail: decrypted.thumbnail || `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
          download: dl.data.data.downloadUrl,
          duration: decrypted.duration,
          quality: '128'
        }
      };

    } catch (error) {
      return { status: false, code: 500, error: error.message };
    }
  }
};

const handler = async (m, { text, usedPrefix, command, conn }) => {
  if (!text) throw `*مثال:* ${usedPrefix + command} *[رابط يوتيوب]*`;

  await conn.sendMessage(m.chat, { text: "⏳ جارٍ التحميل، الرجاء الانتظار..." });

  const data = await savetube.download(text);
  if (!data.status) throw `❌ خطأ: ${data.error}`;

  const result = data.result;
  const audioDetails = `
📌 *العنوان:* ${result.title}
⏳ *المدة:* ${result.duration}
🎵 *الجودة:* ${result.quality}kbps
🖼️ *الصورة:* ${result.thumbnail}
🚀 *جاري إرسال الصوت...*`;

  await conn.sendMessage(m.chat, {
    image: { url: result.thumbnail },
    caption: audioDetails
  });

  await conn.sendMessage(m.chat, {
    audio: { url: result.download },
    mimetype: 'audio/mp4'
  }, { quoted: m });
};

handler.help = ["ytmp3"];
handler.tags = ["downloader"];
handler.command = ["ytmp3"];

export default handler;
