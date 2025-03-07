import axios from 'axios';
import cheerio from 'cheerio';
import FormData from 'form-data';

let handler = async (m, { conn, args }) => {
  if (!args[0]) return m.reply('❌ الرجاء إدخال رابط منشور Instagram.');

  let url = args[0];
  let json = await snapinstApp(url);
  
  if (!json || json.urls.length === 0) {
    return m.reply('❌ لم يتم العثور على فيديو، تأكد من صحة الرابط.');
  }

  let videoUrl = json.urls[0]; // أول فيديو في القائمة
  let username = json.username || 'مجهول';
  
  await conn.sendMessage(m.chat, { 
    video: { url: videoUrl },
    caption: `📥 تم تحميل الفيديو من @${username}`
  }, { quoted: m });
};

handler.help = handler.command = ['instadownload'];
handler.tags = ['downloader'];
export default handler;

async function snapinstApp(url) {
  const { data } = await axios.get('https://snapinst.app/');
  const $ = cheerio.load(data);
  const form = new FormData();

  form.append('url', url);
  form.append('action', 'post');
  form.append('lang', '');
  form.append('cf-turnstile-response', '');
  form.append('token', $('input[name=token]').attr('value'));

  const headers = {
    ...form.getHeaders(),
    'Referer': 'https://snapinst.app/',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  };

  const response = await axios.post('https://snapinst.app/action2.php', form, { headers });
  const executeScript = new Function('callback', response.data.replace('eval', 'callback'));
  
  return new Promise((resolve, reject) => {
    executeScript((html) => {
      const _ = cheerio.load(eval(html.split('.innerHTML = ')[1].split('; document.')[0]));
      resolve({
        avatar: _('.row img:eq(0)').attr('src'),
        username: _('.row div.left:eq(0)').text().trim(),
        urls: _('.row .download-item .download-bottom a').map((i, e) => _(e).attr('href')).get()
      });
    });
  });
}
