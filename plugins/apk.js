import axios from 'axios';
import baileys from '@adiwajshing/baileys';

const { proto, generateWAMessageFromContent, prepareWAMessageMedia } = baileys;

async function response(jid, data, quoted) {
    let msg = generateWAMessageFromContent(jid, {
        viewOnceMessage: {
            message: {
                "messageContextInfo": { "deviceListMetadata": {}, "deviceListMetadataVersion": 2 },
                interactiveMessage: proto.Message.InteractiveMessage.create({
                    body: proto.Message.InteractiveMessage.Body.create({ text: data.body }),
                    footer: proto.Message.InteractiveMessage.Footer.create({ text: data.footer }),
                    header: proto.Message.InteractiveMessage.Header.create({
                        title: data.title,
                        subtitle: data.subtitle,
                        hasMediaAttachment: data.media ? true : false,
                        ...(data.media ? await prepareWAMessageMedia(data.media, { upload: conn.waUploadToServer }) : {})
                    }),
                    nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({ buttons: data.buttons })
                })
            }
        }
    }, { quoted });

    await conn.relayMessage(msg.key.remoteJid, msg.message, { messageId: msg.key.id });
}

let handler = async (m, { conn, command, usedPrefix, text }) => {
    if (command === "apk") {
        if (!text) throw `📝 *اكتب اسم التطبيق الذي تريد البحث عنه*:\n\nمثال: ${usedPrefix + command} whatsapp`;

        try {
            const { data } = await axios.get(`https://api-log-ten.vercel.app/api/download/aptoide?q=${encodeURIComponent(text)}`);
            if (!data.results.length) throw `❌ لم يتم العثور على أي تطبيق تحت الاسم: "${text}".`;

            let sections = [{
                title: '📱 التطبيقات المتوفرة',
                rows: data.results.map(app => ({
                    title: app.name,
                    description: `📂 حجم: ${app.size} | 🕒 آخر تحديث: ${app.lastup}`,
                    id: `.apkview ${app.packageId}`
                }))
            }];

            const listMessage = {
                text: `🔎 *نتائج البحث عن* "${text}":`,
                footer: 'اختر تطبيقًا لعرض التفاصيل 📥',
                body: '🔽 الرجاء اختيار التطبيق الذي تريد تحميله:',
                buttons: [{
                    name: 'single_select',
                    buttonParamsJson: JSON.stringify({ title: 'نتائج البحث', sections })
                }]
            };

            await response(m.chat, listMessage, m);
        } catch (error) {
            if (error.response?.status === 504) {
                await conn.sendMessage(m.chat, { text: "⚠️ *الخادم لم يستجب في الوقت المحدد.*\n🔄 الرجاء إعادة المحاولة بعد قليل." }, { quoted: m });
            } else {
                throw `❌ حدث خطأ أثناء البحث عن التطبيق.`;
            }
        }
    } else if (command === "apkview") {
        if (!text) throw `❓ *طريقة الاستخدام*:\n${usedPrefix + command} <app packageId>`;

        try {
            const { data } = await axios.get(`https://api-log-ten.vercel.app/api/download/aptoide?q=${encodeURIComponent(text)}`);
            const app = data.results.find(a => a.packageId === text);
            if (!app) throw `❌ التطبيق غير موجود!`;

            const details = `📌 *${app.name}*\n📦 *Package ID:* ${app.packageId}\n🕒 *آخر تحديث:* ${app.lastup}\n📂 *الحجم:* ${app.size}\n\n👇 *تحميل التطبيق من هنا:*`;

            const buttons = [{
                name: 'quick_reply',
                buttonParamsJson: JSON.stringify({
                    display_text: "تحميل التطبيق الآن",
                    id: ".apkget " + app.packageId
                })
            }];

            const buttonMessage = {
                body: details,
                footer: 'تحميل التطبيقات من Aptoide',
                buttons,
                media: { image: { url: app.icon } }
            };

            await response(m.chat, buttonMessage, m);
        } catch (error) {
            if (error.response?.status === 504) {
                await conn.sendMessage(m.chat, { text: "⚠️ *الخادم لم يستجب في الوقت المحدد.*\n🔄 الرجاء إعادة المحاولة بعد قليل." }, { quoted: m });
            } else {
                throw `❌ حدث خطأ أثناء عرض تفاصيل التطبيق.`;
            }
        }
    } else if (command === "apkget") {
        if (!text) throw `❓ *طريقة الاستخدام*:\n${usedPrefix + command} <packageId>`;

        try {
            const { data } = await axios.get(`https://api-log-ten.vercel.app/api/download/aptoide?q=${encodeURIComponent(text)}`);
            const app = data.results.find(a => a.packageId === text);
            if (!app) throw `❌ التطبيق غير موجود!`;

            await conn.sendMessage(m.chat, {
                document: { url: app.dllink },
                mimetype: 'application/vnd.android.package-archive',
                fileName: `${app.name}.apk`,
                caption: `✅ *تم تحميل التطبيق بنجاح!*\n📦 *${app.name}*`,
                contextInfo: { mentionedJid: [m.sender] }
            }, { quoted: m });
        } catch (error) {
            if (error.response?.status === 504) {
                await conn.sendMessage(m.chat, { text: "⚠️ *الخادم لم يستجب في الوقت المحدد.*\n🔄 الرجاء إعادة المحاولة بعد قليل." }, { quoted: m });
            } else {
                throw `❌ حدث خطأ أثناء تحميل التطبيق.`;
            }
        }
    }
};

handler.command = ["apk", "apkview", "apkget"];
handler.help = ["apk"];
handler.tags = ["downloader"];
handler.limit = true;

export default handler;
