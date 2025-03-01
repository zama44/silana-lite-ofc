import { sticker } from '../lib/sticker.js';
import axios from 'axios';
import uploadImage from '../lib/uploadImage.js';
import { webp2png } from '../lib/webp2mp4.js';

let handler = async (m, { conn, text }) => {
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || '';
    const { mtype } = m;

    let pp = await conn.profilePictureUrl(m.sender, 'image').catch(() => 'https://telegra.ph/file/a2ae6cbfa40f6eeea0cf1.jpg');

    if (m.quoted) {
        conn.sendMessage(m.chat, {
            react: {
                text: "🕛",
                key: m.key,
            },
        });

        if (q.mtype === 'imageMessage' || q.mtype === 'stickerMessage') {
            let img = await q.download();
            let up;
            if (/webp/g.test(mime)) {
                up = await webp2png(img);
            } else if (/image/g.test(mime)) {
                up = await uploadImage(img);
            }

            let obj = {
                type: "quote",
                format: "png",
                backgroundColor: "#ffff",
                width: 512,
                height: 768,
                scale: 2,
                messages: [{
                    entities: [],
                    media: { url: up },
                    avatar: true,
                    from: {
                        id: 1,
                        name: m.name,
                        photo: { url: pp }
                    },
                    text: q ? q.text : text || '',
                    replyMessage: {}
                }]
            };

            let buffer = await Quotly(obj);
            let stickerFile = await sticker(buffer, false, global.packname, global.author);
            if (stickerFile) {
                return conn.sendFile(m.chat, stickerFile, 'Quotly.webp', '', m).then(() => {
                    conn.sendMessage(m.chat, {
                        react: {
                            text: "✅",
                            key: m.key,
                        },
                    });
                });
            }

        } else {
            let obj = {
                type: "quote",
                format: "png",
                backgroundColor: "#ffff",
                width: 512,
                height: 768,
                scale: 2,
                messages: [{
                    entities: [],
                    avatar: true,
                    from: {
                        id: 1,
                        name: m.name,
                        photo: { url: pp }
                    },
                    text: q ? q.text : text || '',
                    replyMessage: {}
                }]
            };

            const buffer = await Quotly(obj);
            let stickerFile = await sticker(buffer, false, global.packname, global.author);
            if (stickerFile) {
                return conn.sendFile(m.chat, stickerFile, 'Quotly.webp', '', m).then(() => {
                    conn.sendMessage(m.chat, {
                        react: {
                            text: "✅",
                            key: m.key,
                        },
                    });
                });
            }
        }

    } else {
        conn.sendMessage(m.chat, {
            react: {
                text: "🕛",
                key: m.key,
            },
        });

        let obj2 = {
            type: "quote",
            format: "png",
            backgroundColor: "#ffff",
            width: 512,
            height: 768,
            scale: 2,
            messages: [{
                entities: [],
                avatar: true,
                from: {
                    id: 1,
                    name: m.name,
                    photo: { url: pp }
                },
                text: text || '',
                replyMessage: {}
            }]
        };

        const buffer = await Quotly(obj2);
        let stickerFile2 = await sticker(buffer, false, global.packname, global.author);
        if (stickerFile2) {
            return conn.sendFile(m.chat, stickerFile2, 'Quotly.webp', '', m).then(() => {
                conn.sendMessage(m.chat, {
                    react: {
                        text: "✅",
                        key: m.key,
                    },
                });
            });
        }
    }
};

handler.help = ['qc2'];
handler.tags = ['sticker'];
handler.command = /^(qc2|quotly2)$/i;

handler.limit = true;

export default handler;

async function Quotly(obj) {
    let json;

    try {
        json = await axios.post(
            "https://bot.lyo.su/quote/generate",
            obj,
            {
                headers: {
                    "Content-Type": "application/json",
                },
            },
        );
    } catch (e) {
        return e;
    }

    const results = json.data.result.image;
    const buffer = Buffer.from(results, "base64");
    return buffer;
}
