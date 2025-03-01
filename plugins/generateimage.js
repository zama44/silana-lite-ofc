import axios from 'axios'

let handler = async (m, { conn }) => {
  const options = { prompt: "concept art forest, enchanted, portrait, digital artwork, illustrative, painterly, matte painting, highly detailed." }
  
  try {
    // Send a reply to inform the user that the image generation is in progress
    await m.reply("Generating your image, please wait...")

    const res = await axios({
      url: 'https://s9.piclumen.art/comfy/api/generate-image',
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        'Response-Type': 'image/jpeg',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 14; NX769J Build/UKQ1.230917.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/130.0.6723.107 Mobile Safari/537.36',
      },
      data: {
        prompt: options.prompt
      },
      responseType: 'arraybuffer'
    });
    
    // Sending the image response to the user
    if (res.data) {
      await conn.sendMessage(m.chat, { image: res.data }, { caption: "Here is your generated image!" })
    } else {
      await conn.sendMessage(m.chat, { text: 'Failed to generate the image' })
    }
  } catch (e) {
    await conn.sendMessage(m.chat, { text: `An error occurred: ${e.message}` })
  }
}

handler.help = handler.command = ['generateimage']
handler.tags = ['tools']

export default handler
