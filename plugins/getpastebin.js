import fetch from 'node-fetch';

const handler = async (m, { args }) => {
  if (!args[0]) return m.reply('Enter the Pastebin URL!');

  let url = encodeURIComponent(args[0]);
  let api = `https://fastrestapis.fasturl.cloud/downup/pastebindown?url=${url}`;

  try {
    let res = await fetch(api);
    let json = await res.json();

    if (json.status !== 200) throw json;

    let { title, rawLink, downloadLink, content, datePosted, username, viewCount } = json.result;

    let message = `*Title:* ${title}\n*Uploaded by:* ${username}\n*Date:* ${datePosted}\n*Views:* ${viewCount} times\n\n*Content:*\n${content}\n\n*Raw Link:* ${rawLink}\n*Download Link:* ${downloadLink}`;

    m.reply(message);
  } catch (e) {
    console.error(e);
    m.reply('Failed to retrieve Pastebin data!');
  }
};

handler.command = ['getpastebin'];
handler.help = ['getpastebin'];
handler.tags = ['tools'];
export default handler;
