import fetch from 'node-fetch';

const handler = async (m, { text }) => {
  if (!text) {
    return m.reply('❌ الرجاء إدخال نص لإنشاء الصورة.');
  }

  const apiUrl = `https://jazxcode.biz.id/ai/texttoimg?prompt=${encodeURIComponent(text)}`;

  try {
    await m.reply('⏳ المرجو الانتظار قليلا لا تنسى ان تتابع \n instagram.com/noureddine_ouafy');
    
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

    const json = await response.json();
    if (!json.status || !json.images || json.images.length === 0) {
      throw new Error('❌ لم يتم العثور على أي صور.');
    }

    for (const imageUrl of json.images) {
      await conn.sendFile(m.chat, imageUrl, 'ai-image.jpg', `✅ صورة تم إنشاؤها للنص: *${text}*`, m);
    }
  } catch (error) {
    console.error(error);
    m.reply('❌ حدث خطأ أثناء إنشاء الصورة.');
  }
};

handler.help = ['texttoimg'];
handler.tags = ['ai'];
handler.command = ['texttoimg'];

export default handler;
