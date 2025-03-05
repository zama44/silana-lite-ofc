import axios from 'axios';
import crypto from 'crypto';
import yts from 'yt-search';

const handler = async (m, { conn, args, command }) => {
  if (args.length < 1) return m.reply(`🔎 *YouTube Search:*\n- *.playx <title>*\n\n📥 *Download Video/Audio:*\n- *.ytmp3x <url>*\n- *.ytmp4x <url> [quality]\n\n📌 *Quality:* 144, 240, 360, 480, 720, 1080 (default: 720p for videos)`);

  let query = args.join(' ');
  let who = m.sender;
  let username = conn.getName(who);

  let fkon = { 
    key: { 
      fromMe: false, 
      participant: `0@c.us`, 
      remoteJid: `status@broadcast`
    }, 
    message: { 
      contactMessage: { 
        displayName: username, 
        vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;${username},;;;\nFN:${username}\nEND:VCARD`
      }
    }
  };

  switch (command) {
    case 'playx':
      try {
        let searchResults = await yts(query);
        let video = searchResults.videos[0];

        if (!video) return m.reply("⚠️ *No results found for that search!*");

        let caption = `🎵 *Play Music*\n\n`
          + `📽 *Title:* ${video.title}\n`
          + `📅 *Uploaded:* ${video.ago}\n`
          + `🛰️ *Duration:* ${video.timestamp}\n`
          + `🔭 *Views:* ${video.views.toLocaleString()}\n`
          + `🎥 *Channel:* ${video.author.name}\n`
          + `🔗 *Source:* ${video.url}`;

        let ytmp3 = await downloadYouTube(video.url, 'mp3');

        if (!ytmp3.status) return m.reply(`❌ *Failed to download audio!*`);

        await conn.sendMessage(m.chat, { 
          image: { url: video.thumbnail }, 
          caption 
        }, { quoted: fkon });

        await conn.sendMessage(m.chat, { 
          audio: { url: ytmp3.result.download }, 
          mimetype: 'audio/mp4', 
          fileName: `${video.title}.mp3`
        }, { quoted: fkon });

      } catch (e) {
        return m.reply(`❌ *Failed to search for video!*`);
      }
      break;

    case 'ytmp3x':
    case 'ytmp4x':
      let format = command === 'ytmp3x' ? 'mp3' : args[1] || '720';
      if (!/^https?:\/\/(www\.)?youtube\.com|youtu\.be/.test(args[0])) return m.reply("⚠️ *Enter a valid YouTube link!*");

      try {
        let res = await downloadYouTube(args[0], format);
        if (!res.status) return m.reply(`❌ *Error:* ${res.error}`);

        let { title, download, type } = res.result;

        if (type === 'video') {
          await conn.sendMessage(m.chat, { 
            video: { url: download },
            caption: `🎬 *${title}*`
          }, { quoted: fkon });
        } else {
          await conn.sendMessage(m.chat, { 
            audio: { url: download }, 
            mimetype: 'audio/mp4', 
            fileName: `${title}.mp3`
          }, { quoted: fkon });
        }
      } catch (e) {
        m.reply(`❌ *Failed to download!*`);
      }
      break;

    default:
      m.reply("*Unknown command!*");
  }
}

handler.help = ['playx', 'ytmp3x', 'ytmp4x']
handler.command = ['playx', 'ytmp3x', 'ytmp4x']
handler.command = ['downloader'];
export default handler

// ========FUNCTION==========

async function downloadYouTube(link, format = '720') {
  const apiBase = "https://media.savetube.me/api";
  const apiCDN = "/random-cdn";
  const apiInfo = "/v2/info";
  const apiDownload = "/download";

  const decryptData = async (enc) => {
    try {
      const key = Buffer.from('C5D58EF67A7584E4A29F6C35BBC4EB12', 'hex');
      const data = Buffer.from(enc, 'base64');
      const iv = data.slice(0, 16);
      const content = data.slice(16);
      
      const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
      let decrypted = decipher.update(content);
      decrypted = Buffer.concat([decrypted, decipher.final()]);
      
      return JSON.parse(decrypted.toString());
    } catch (error) {
      return null;
    }
  };

  const request = async (endpoint, data = {}, method = 'post') => {
    try {
      const { data: response } = await axios({
        method,
        url: `${endpoint.startsWith('http') ? '' : apiBase}${endpoint}`,
        data: method === 'post' ? data : undefined,
        params: method === 'get' ? data : undefined,
        headers: {
          'accept': '*/*',
          'content-type': 'application/json',
          'origin': 'https://yt.savetube.me',
          'referer': 'https://yt.savetube.me/',
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36'
        }
      });
      return { status: true, data: response };
    } catch (error) {
      return { status: false, error: error.message };
    }
  };

  const youtubeID = link.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([a-zA-Z0-9_-]{11})/);
  if (!youtubeID) return { status: false, error: "Failed to extract video ID from URL." };

  try {
    const cdnRes = await request(apiCDN, {}, 'get');
    if (!cdnRes.status) return cdnRes;
    const cdn = cdnRes.data.cdn;

    const infoRes = await request(`https://${cdn}${apiInfo}`, { url: `https://www.youtube.com/watch?v=${youtubeID[1]}` });
    if (!infoRes.status) return infoRes;
    
    const decrypted = await decryptData(infoRes.data.data);
    if (!decrypted) return { status: false, error: "Failed to decrypt video data." };

    const downloadRes = await request(`https://${cdn}${apiDownload}`, {
      id: youtubeID[1],
      downloadType: format === 'mp3' ? 'audio' : 'video',
      quality: format,
      key: decrypted.key
    });

    return {
      status: true,
      result: {
        title: decrypted.title || "Unknown",
        type: format === 'mp3' ? 'audio' : 'video',
        format: format,
        download: downloadRes.data.data.downloadUrl
      }
    };
  } catch (error) {
    return { status: false, error: error.message };
  }
}
