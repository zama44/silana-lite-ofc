import axios from 'axios';

// Function to generate a random 6-digit number
function randomNumber() {
  let randomNumber = Math.floor(Math.random() * 1000000);
  return randomNumber.toString().padStart(6, '0');
}

// Function to upscale an image using the ImgGen API
async function upscale(buffer) {
  const blob = new Blob([buffer], { type: 'image/png' });
  let filename = randomNumber() + '.png';
  let formData = new FormData();
  formData.append('image', blob, filename);

  // Upload the image
  let { data } = await axios.post('https://api.imggen.ai/guest-upload', formData, {
    headers: {
      "content-type": "multipart/form-data",
      origin: "https://imggen.ai",
      referer: "https://imggen.ai/",
      "user-agent": "Mozilla/5.0"
    }
  });

  // Perform the upscale operation
  let result = await axios.post('https://api.imggen.ai/guest-upscale-image', {
    image: {
      "url": "https://api.imggen.ai" + data.image.url,
      "name": data.image.name,
      "original_name": data.image.original_name,
      "folder_name": data.image.folder_name,
      "extname": data.image.extname
    }
  }, {
    headers: {
      "content-type": "application/json",
      origin: "https://imggen.ai",
      referer: "https://imggen.ai/",
      "user-agent": "Mozilla/5.0"
    }
  });

  return `https://api.imggen.ai${result.data.upscaled_image}`;
}

// WhatsApp bot handler
let handler = async (m, { conn }) => {
  try {
    await m.react('⌛'); // React with a loading emoji

    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || '';

    // Check if the message contains an image
    if (!mime.startsWith('image/')) {
      throw 'Please send an image with the caption *hd/remini* or reply to an image!';
    }

    let media = await q.download();
    if (!media) throw 'Failed to download the image.';

    let upscaledUrl = await upscale(media);
    if (!upscaledUrl) throw 'Failed to upscale the image.';

    await m.react('✅'); // React with a success emoji

    await conn.sendMessage(m.chat, {
      image: { url: upscaledUrl },
      caption: `*Done*`
    }, { quoted: m });

  } catch (error) {
    await m.react('❌'); // React with an error emoji
    await conn.reply(m.chat, `❌ *Error:* ${error.message || error}`, m);
  }
};

// Command details
handler.help = ['hdphoto'];
handler.tags = ['tools'];
handler.command = /^hdphoto$/i;

export default handler;
