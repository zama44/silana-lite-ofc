let handler = async (m, { conn, args, usedPrefix, command }) => {
    if (!args[0] || isNaN(args[0])) throw `Enter a number representing the number of days!\n*Example: ${usedPrefix + command} 20* \n\n after dyration the bot will be lefted`;

    let who;
    if (m.isGroup) who = args[1] ? args[1] : m.chat;
    else who = args[1];

    var daysAmount = 86400000 * args[0];
    var now = new Date() * 1;
    if (now < global.db.data.chats[who].expired) global.db.data.chats[who].expired = daysAmount;
    else global.db.data.chats[who].expired = now + daysAmount;

    conn.reply(m.chat, `Successfully set the expiration date for this group for ${args[0]} days.\n\nCountdown: ${msToDate(global.db.data.chats[who].expired - now)}`, m);
};

handler.help = ['group-end'];
handler.tags = ['owner'];
handler.command = /^(group-end)$/i;
handler.rowner = true;
handler.premium = false;

module.exports = handler;

function msToDate(ms) {
    let temp = ms;
    let days = Math.floor(ms / (24 * 60 * 60 * 1000));
    let daysms = ms % (24 * 60 * 60 * 1000);
    let hours = Math.floor(daysms / (60 * 60 * 1000));
    let hoursms = ms % (60 * 60 * 1000);
    let minutes = Math.floor(hoursms / (60 * 1000));
    let minutesms = ms % (60 * 1000);
    let sec = Math.floor(minutesms / 1000);
    return days + " Days " + hours + " Hours " + minutes + " Minutes";
}
