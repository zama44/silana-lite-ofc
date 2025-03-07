import axios from 'axios'

let handler = async (m, { conn, args }) => {
    const userId = args[0]

    if (!userId) throw 'يرجى إدخال معرف المستخدم (User ID) \n\n ex : *.freefire 2397091710*'

    let { key } = await conn.sendMessage(m.chat, {
        text: "جاري التحقق من بيانات الحساب...",
    })

    try {
        let res = await axios.get(`https://api.ryzendesu.vip/api/stalk/ff?userId=${userId}`)
        let result = res.data

        if (!result.name) throw 'لم تُرجِع API بيانات صالحة'

        let equippedItemsText = ''
        if (result.equippedItems && Array.isArray(result.equippedItems)) {
            equippedItemsText = result.equippedItems
                .map((item, index) => `${index + 1}. ${item.name}`)
                .join('\n')
        }

        let captionText = `
*المعلومات الرئيسية:*
> الاسم: ${result.name}
> البايو: ${result.bio}
> الإعجابات: ${result.like}
> المستوى: ${result.level}
> نقاط الخبرة: ${result.exp}
> المنطقة: ${result.region}
> نقاط الشرف: ${result.honorScore}
> تصنيف BR: ${result.brRank} (${result.brRankPoint})
> نقاط تصنيف CS: ${result.csRankPoint}
> تاريخ إنشاء الحساب: ${result.accountCreated}
> آخر تسجيل دخول: ${result.lastLogin}
> النمط المفضل: ${result.preferMode}
> اللغة: ${result.language}
> مستوى Booyah Pass: ${result.booyahPassLevel}

*معلومات الحيوانات الأليفة:*
> الاسم: ${result.petInformation.name}
> المستوى: ${result.petInformation.level}
> نقاط الخبرة: ${result.petInformation.exp}
> مميز بنجمة: ${result.petInformation.starMarked}
> محدد: ${result.petInformation.selected}

*العناصر المجهزة:*
${equippedItemsText}
        `

        await conn.sendMessage(m.chat, {
            image: { url: "https://f.uguu.se/DDSzwUui.jpg" },
            caption: captionText
        })
    } catch (e) {
        await conn.sendMessage(m.chat, {
            text: `خطأ من API: ${e}`,
            edit: key
        })
    }
}

handler.help = ['freefire']
handler.tags = ['tools']
handler.command = /^(freefire)$/i
handler.limit = true
export default handler
