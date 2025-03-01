import { search, download } from 'aptoide-scraper';
import baileys from '@adiwajshing/baileys';

const { proto, generateWAMessageFromContent, prepareWAMessageMedia } = baileys;

async function response(jid, data, quoted) {
    let msg = generateWAMessageFromContent(jid, {
        viewOnceMessage: {
            message: {
                "messageContextInfo": {
                    "deviceListMetadata": {},
                    "deviceListMetadataVersion": 2
                },
                interactiveMessage: proto.Message.InteractiveMessage.create({
                    body: proto.Message.InteractiveMessage.Body.create({ text: data.body }),
                    footer: proto.Message.InteractiveMessage.Footer.create({ text: data.footer }),
                    header: proto.Message.InteractiveMessage.Header.create({
                        title: data.title,
                        subtitle: data.subtitle,
                        hasMediaAttachment: data.media ? true : false,
                        ...(data.media ? await prepareWAMessageMedia(data.media, { upload: conn.waUploadToServer }) : {})
                    }),
                    nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                        buttons: data.buttons
                    })
                })
            }
        }
    }, { quoted });

    await conn.relayMessage(msg.key.remoteJid, msg.message, { messageId: msg.key.id });
}

let handler = async (m, { conn, command, usedPrefix, text }) => {
    if (!text) throw `اكتب اسم التطبيق للبحث عنه، مثال:\n\n${usedPrefix + command} facebook lite`;

    if (command === "apk") {
        const data = await search(text);
        if (!data.length) throw `لم يتم العثور على أي تطبيق باسم "${text}".`;

        let sections = [
            {
                title: 'التطبيقات المتوفرة',
                highlight_label: 'Top',
                rows: data.map(app => ({
                    title: app.name,
                    description: `عرض تفاصيل "${app.name}"`,
                    id: `.apkview ${app.id}`
                }))
            }
        ];

        const listMessage = {
            text: `نتائج البحث عن "${text}":`,
            footer: 'حدد تطبيقًا لعرض تفاصيله',
            body: 'يرجى اختيار التطبيق الذي تريد تحميله',
            buttons: [{
                name: 'single_select',
                buttonParamsJson: JSON.stringify({
                    title: 'نتائج بحث التطبيقات',
                    sections
                })
            }]
        };

        await response(m.chat, listMessage, m);

    } else if (command === "apkview") {
        const appDetails = await download(text);
        if (!appDetails) throw `لم يتم العثور على معلومات حول التطبيق "${text}".`;

        const details = `*📌 الاسم:* ${appDetails.name}\n*📅 آخر تحديث:* ${appDetails.lastup}\n*📦 الحجم:* ${appDetails.size}\n\n🔽 لتحميل التطبيق، اضغط على الزر أدناه:`;

        const buttons = [{
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({
                display_text: "تحميل التطبيق الآن",
                id: ".apkget " + appDetails.id
            })
        }];

        const buttonMessage = {
            body: details,
            footer: 'تحميل التطبيقات من Aptoide',
            buttons,
            media: { image: { url: appDetails.icon }}
        };

        await response(m.chat, buttonMessage, m);

    } else if (command === "apkget") {
        const appData = await download(text);
        if (!appData || !appData.dllink) throw `تعذر العثور على رابط التحميل للتطبيق "${text}".`;

        await conn.sendMessage(m.chat, {
            document: { url: appData.dllink },
            mimetype: 'application/vnd.android.package-archive',
            fileName: `${appData.name}.apk`,
            caption: `تم تحميل التطبيق بنجاح!`,
            contextInfo: { mentionedJid: [m.sender] }
        }, { quoted: m });
    }
};

handler.command = ["apk", "apkview", "apkget"];
handler.help = ["apk"];
handler.tags = ["downloader"];
handler.limit = true;

export default handler;
