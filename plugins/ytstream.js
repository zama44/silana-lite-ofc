// instagram.com/noureddine_ouafy
import fetch from 'node-fetch'

let handler = async (m, { conn, args, command }) => {
  if (args.length < 2) {
    throw `Please specify the type and the query.\n\nExample:\n.${command} audio satisfya\n.${command} video https://youtube.com/watch?v=xxxxx \n .ytstream video query`
  }

  let stream_type = args[0].toLowerCase()
  if (stream_type !== 'audio' && stream_type !== 'video') {
    throw `Invalid type.\nPlease choose either 'audio' or 'video'.`
  }

  let query = args.slice(1).join(' ')
  let api_url = 'http://154.26.159.2:1470/video'

  let params = new URLSearchParams({ query: query, video: stream_type === 'video' })
  let res = await fetch(`${api_url}?${params}`)
  if (!res.ok) throw await res.text()

  let json = await res.json()
  
  if (!json.stream_url) throw 'Failed to retrieve the stream URL.'

  if (stream_type === 'audio') {
    await conn.sendMessage(m.chat, { audio: { url: json.stream_url }, mimetype: 'audio/mpeg' }, { quoted: m })
  } else {
    await conn.sendMessage(m.chat, { video: { url: json.stream_url }, caption: json.title }, { quoted: m })
  }
}

handler.help = ['ytstream']
handler.tags = ['downloader']
handler.command = ['ytstream']
handler.limit = true 
export default handler
