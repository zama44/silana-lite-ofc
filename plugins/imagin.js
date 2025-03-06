import axios from 'axios';

async function generateImage(prompt) {
  try {
    const res = await axios({
      url: 'https://s9.piclumen.art/comfy/api/generate-image',
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        'Response-Type': 'image/jpeg',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 14; NX769J Build/UKQ1.230917.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/130.0.6723.107 Mobile Safari/537.36',
      },
      data: { prompt },
      responseType: 'arraybuffer'
    });

    return { status: true, data: res.data };
  } catch (e) {
    return { status: false, msg: `An error occurred: ${e.message}` };
  }
}

async function handler(m, { text, conn }) {
  if (!text) {
    return conn.sendMessage(m.chat, { text: '\n\n*Example:*\n.girl and cats' }, { quoted: m });
  }

  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

  const result = await generateImage(text);

  if (result.status) {
    await conn.sendMessage(m.chat, { image: result.data, caption: 'Here is your generated image.' }, { quoted: m });
  } else {
    await conn.sendMessage(m.chat, { text: result.msg }, { quoted: m });
  }
}

handler.command = ['imagin'];
handler.tags = ['ai'];
handler.help = ['imagin'];

export default handler;
