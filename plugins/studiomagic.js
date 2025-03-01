import axios from "axios";

const handler = async (m, { conn, text }) => {
    if (!text) {
        return m.reply("Please enter text to generate the image!");
    }

    async function magicStudio(prompt) {
        try {
            const res = await axios.get("https://velyn.vercel.app/api/ai/magicStudio", {
                params: { prompt },
                responseType: "arraybuffer"
            });

            const image = Buffer.from(res.data);

            if (!image || image.length <= 10240) {
                throw new Error("Failed to generate the image or the image is too small.");
            }

            return { success: true, image };
        } catch (error) {
            console.error("Error in magicStudio:", error.message);
            return { success: false, error: error.message };
        }
    }

    const result = await magicStudio(text);

    if (!result.success) {
        return m.reply(`An error occurred: ${result.error}`);
    }

    const messageOptions = {
        image: result.image,
        caption: "✅ Image generated successfully!",
        mimetype: "image/jpeg"
    };

    await conn.sendMessage(m.chat, messageOptions, { quoted: m });
};

handler.command = ['studiomagic'];
handler.tags = ["ai"];
handler.help = [ 'studiomagic'];

export default handler;
