/* Plugins Cjs/Esm by RAF#1  
Why claim that I made it? I just converted the scrape into a plugin via ChatGPT :v */  

// ESM  
import axios from "axios";  

let handler = async (m, { conn, usedPrefix, command }) => {  
  if (!m.quoted || !m.quoted.mimetype || !m.quoted.mimetype.includes('image')) {  
    return m.reply(`Reply to an image using the command *${usedPrefix + command}*`);  
  }  

  try {  
    let media = await m.quoted.download();  
    let base64 = media.toString("base64");  
    let payload = { imageUrl: `data:image/jpeg;base64,${base64}` };  

    let { data } = await axios.post("https://ghibliai-worker.ahmadjandal.workers.dev/generate", payload);  

    let result = data.result;  
    if (!result) throw new Error("Error processing image");  

    let buffer = Buffer.from(result.replace(/^data:image\/\w+;base64,/, ""), "base64");  
    
    await conn.sendMessage(m.chat, { image: buffer, caption: wm }, { quoted: m });  

  } catch (e) {  
    console.error(e);  
    m.reply("An error occurred.");  
  }  
};  

handler.help = ["ghibli"];  
handler.tags = ["ai"];  
handler.command = /^ghibli$/i;  
handler.limit = true;  
handler.register = false;  
export default handler;
