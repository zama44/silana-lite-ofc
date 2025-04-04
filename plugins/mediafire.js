import fetch from 'node-fetch';
import { lookup } from 'mime-types';

/**
 * MediaFire Scraper
 * Thanks to the creator of this scraper
 * Source: https://whatsapp.com/channel/0029VakezCJDp2Q68C61RH2C
 * Ar sens
 */

async function MediaFire(url) {
    try {
        const response = await fetch(`https://r.jina.ai/${url}`);
        const text = await response.text();

        const result = {
            filename: '',
            size: '',
            mimetype: '',
            url: '',
            repair: ''
        };

        // Extract filename from URL
        const fileMatch = url.match(/\/file\/[^\/]+\/([^\/]+)/);
        if (fileMatch) result.filename = decodeURIComponent(fileMatch[1]);

        let ext = result.filename.split(".").pop();
        if (ext) result.mimetype = lookup(ext.toLowerCase()) || `application/${ext}`;

        // Extract the download URL and file size
        const matchUrl = text.match(/(https:\/\/download\d+\.mediafire\.com\/[^\s"]+)/);
        if (matchUrl) result.url = matchUrl[1];

        const matchSize = text.match(/(\d+(\.\d+)?[KMGT]B)/);
        if (matchSize) result.size = matchSize[1];

        if (!result.url) return { error: "Failed to obtain download link." };

        return result;
    } catch (error) {
        return { error: error.message };
    }
}

let handler = async (m, { conn, text }) => {
    if (!text) return m.reply('*Please provide a MediaFire link!*');

    try {
        let result = await MediaFire(text);

        if (result.error) {
            return m.reply(`*${result.error}*`);
        }

        let caption = `┌──⭓ *MEDIAFIRE DOWNLOADER*  
│ *Name:* ${result.filename}  
└───────────⭓  
> Requested by ${m.pushName}`;

        await conn.sendMessage(m.chat, { text: caption }, m);
        await conn.sendMessage(m.chat, { 
            document: { url: result.url }, 
            mimetype: result.mimetype, 
            fileName: result.filename 
        }, m);
    } catch (error) {
        console.error(error);
        m.reply('*An error occurred while fetching the MediaFire link.*');
    }
};

handler.help = ['mediafire'];
handler.tags = ['download'];
handler.command = /^(mf|mediafire)$/i;
handler.register = false;
handler.limit = true;

export default handler;
