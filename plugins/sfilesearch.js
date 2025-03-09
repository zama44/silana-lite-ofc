import fetch from 'node-fetch'
import cheerio from 'cheerio'

async function sfileSearch(query) {
  try {
    const response = await fetch(`https://sfile.mobi/search.php?q=${encodeURIComponent(query)}&search=Search`)
    const html = await response.text()
    const $ = cheerio.load(html)

    const result = $('div.w3-card.white > div.list').map((_, el) => {
      const anchor = $(el).find('a')
      const name = anchor.text().trim()
      const link = anchor.attr('href')
      const size_text = $(el).text().split('(')[1]
      const size = size_text ? size_text.split(')')[0] : '-'

      return { name, size, link }
    }).get()

    return result
  } catch (err) {
    throw new Error(err.message)
  }
}

let handler = async (m, { conn, text }) => {
  if (!text) return m.reply('يرجى إدخال اسم الملف للبحث عنه!')

  let results = await sfileSearch(text)
  if (!results.length) return m.reply('لم يتم العثور على أي نتائج.')

  let message = results.map((file, index) => 
    `${index + 1}. *${file.name}*\n📦 الحجم: ${file.size}\n🔗 الرابط: ${file.link}`
  ).join('\n\n')

  m.reply(message)
}

handler.help = ['sfilesearch']
handler.tags = ['search']
handler.command = ['sfilesearch']

export default handler
