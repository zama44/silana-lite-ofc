import axios from 'axios';

const generateFurbrat = async (text) => {
  try {
    return await new Promise((resolve, reject) => {
      if (!text) return reject("🚩 Missing text input!");
      axios
        .get("https://fastrestapis.fasturl.link/tool/furbrat", {
          params: { text },
          responseType: "arraybuffer",
        })
        .then((res) => {
          const image = Buffer.from(res.data);
          if (image.length <= 10240) return reject("🚩 Failed to generate Furbrat!");
          return resolve({
            success: true,
            image,
          });
        })
        .catch((err) => reject(err.message));
    });
  } catch (error) {
    return {
      success: false,
      error,
    };
  }
};

let handler = async (m, { conn, args }) => {
  if (!args[0]) throw `🚩 *Usage:* .furbrat silana ai`;
  
  const text = args.join(' ');

  try {
    const response = await generateFurbrat(text);
    if (response.success) {
      await conn.sendFile(m.chat, response.image, 'furbrat.jpg', `🍟 *Furbrat Generated Successfully! With silana Ai*\n\nText: ${text}`, m);
    } else {
      throw response.error || "🚩 An unknown error occurred!";
    }
  } catch (error) {
    throw `🚩 Error: ${error}`;
  }
};

handler.help = ['furbrat'];
handler.tags = ['tools'];
handler.command = /^(furbrat)$/i;
handler.limit = true
export default handler;
