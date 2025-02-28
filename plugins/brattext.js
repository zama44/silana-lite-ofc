import fetch from 'node-fetch'

let handler = async (m, { conn, args }) => {
  let text = args.join(' ')
  if (!text) return m.reply('Please provide text to generate a response.')

  try {
    let apiUrl = `https://brat.zellray.my.id/brat?text=${encodeURIComponent(text)}`
    let response = await fetch(apiUrl)
    let buffer = await response.arrayBuffer()

    await conn.sendMessage(m.chat, { sticker: { url: apiUrl } }, { quoted: m })
  } catch (error) {
    console.error(error)
    await m.reply('Error generating sticker. Please try again later.')
  }
}

handler.help = handler.command = ['brattext']
handler.tags = ['sticker']
export default handler
