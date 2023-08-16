const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "fullmoon",
  desc: "Checks when the next Full Moon event is via the official TF2 wiki.",
  run: async ({ bot, message, args }) => {
    const wikiPage = await getPage()
    const currentEvent = `${wikiPage.split('"/wiki/File:Full_Moon_')[1].split('.png')[0]}`
    await fmEmbed(currentEvent, wikiPage, message)
  }
}

async function getPage() {
  const fetchJson = await fetch(`https://wiki.teamfortress.com/w/api.php?action=parse&page=Full_Moon`, { method: 'GET' }
  ).then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP Error ${response.status}! (FM)`)
    }// else console.log(`FM Response OK!`)
    return response.text()
  }).catch(err => console.error(`[${Date.now()}] ${err}`))
  return fetchJson.toString().split('text": {')[1].split('lunar calendar')[0].split('*": "')[1].toString()
}

async function fmEmbed(num, wikiPage, message) {
  let fmImageVer = ''
  switch (num) {
    case '0': fmImageVer = ["We're not currently in a full moon.", 0xFF0000, 'https://wiki.teamfortress.com/w/images/b/b4/Full_Moon_0.png']; break;
    case '1': fmImageVer = ["We're currently in a full moon!", 0x191970, 'https://wiki.teamfortress.com/w/images/8/87/Full_Moon_1.png']; break;
    case '2': fmImageVer = ["We're currently in a Halloween Event!", 0xFF8C00, 'https://wiki.teamfortress.com/w/images/6/6d/Full_Moon_2.png']; break;
    default: fmImageVer = ["Status could not be retrieved", 0x000000, 'https://wiki.teamfortress.com/w/images/b/b7/Ghost_Yikes%21.png']; break;
  }

  let fullMoonEmbed = new EmbedBuilder()
  fullMoonEmbed.setColor(fmImageVer[1])
  fullMoonEmbed.setTitle(fmImageVer[0])
  fullMoonEmbed.setAuthor({ name: 'Pulled directly from the TF2 wiki!', url: 'https://wiki.teamfortress.com/wiki/Full_Moon' })
  fullMoonEmbed.setURL('https://wiki.teamfortress.com/wiki/Full_Moon')
  fullMoonEmbed.setThumbnail(fmImageVer[2])
  fullMoonEmbed.setFooter({
    text: "Disclaimer: The above date and time are computed by formulas internal to the TF2 wiki, and is provided as an estimate only.  " +
      "Additionally, the times that the game sets for each of its Full Moon holidays can be a day or more before or after the real world Full Moons."
  })
  if (num == '0') {
    const dateParts = wikiPage.split('The next full moon is from ')[1].split('(UTC)')[0].trim().replaceAll('&lt;', '').replaceAll('b>', '').split(' UTC/ through to ')
    function timeStamp(num) { return new Date(dateParts[0].replace(' UTC/', '').replace('at ', '') + ':00') / 1000 }
    const nextFullMoon = `**The next full moon is from <t:${timeStamp(0)}:F> through to <t:${timeStamp(1)}:F>**, ` +
      `starting <t:${timeStamp(0)}:R> (approximate).` +
      '\n\n*For more upcoming and previous moon times, please refer to the wiki: https://wiki.teamfortress.com/wiki/Full_Moon*'
    fullMoonEmbed.setDescription(nextFullMoon)
  }
  await message.channel.send({ embeds: [fullMoonEmbed] })
}

// I initially planned to do the math myself, but the wiki already does, so i'm using that directly.  Storing the old stuff here just in case.
/*

const date1 = new Date('November 17, 2021 04:26:59 UTC');
async function fmcDate(offset, adjustment) {
    const current = new Date(Date.now())
    const currentGSD = await gsd(current.getUTCFullYear(), current.getUTCMonth(), current.getUTCDay())
    return date1 + (((Math.ceiling(currentGSD / 29.53) + offset) * 2551392000) + (adjustment*2*86400000))
}

async function gsd(year, month, day) {
    let days_this_year = (month - 1) * 30.5 + day
    if (month > 2) {
        if (year % 4 == 0 && (year % 100 != 0 || year % 400 == 0)) days_this_year = days_this_year - 1
        else days_this_year = days_this_year - 2
        if (month > 8) days_this_year = days_this_year + 0.9
    }
    days_this_year = Math.floor(days_this_year + 0.5)
    year = year - 1
    let days_from_past_years = year * 365 + Math.floor(year / 4) - Math.floor(year / 100) + Math.floor(year / 400)
    return days_from_past_years + days_this_year - 799416
}

PAGE

[[File:Full Moon {{If_full_moon}}.png|Full Moon]]<br />{{#switch:{{If_full_moon}}
| 2 = (color:#FF8C00) We're currently in a Halloween Event!\n{{Full moon status}}
| 1 = (color:#191970) We're currently in a full moon.<!--\n{{Full moon status}}-->
| 0 = (color:#FF0000) We're not currently in a full moon.\n{{Full moon status}}
}}

== Upcoming Full Moons ==
{{#switch:{{If full moon}}
 | 2 =* {{Fmc4|adjustment=0|offset=0}} through to {{Fmc4|adjustment=1|offset=0}}
 | 1 = 
 | 0 =* {{Fmc4|adjustment=0|offset=0}} through to {{Fmc4|adjustment=1|offset=0}}
}}
* {{Fmc4|adjustment=0|offset=1}} through to {{Fmc4|adjustment=1|offset=1}}
* {{Fmc4|adjustment=0|offset=2}} through to {{Fmc4|adjustment=1|offset=2}}
* {{Fmc4|adjustment=0|offset=3}} through to {{Fmc4|adjustment=1|offset=3}}
* {{Fmc4|adjustment=0|offset=4}} through to {{Fmc4|adjustment=1|offset=4}}
* {{Fmc4|adjustment=0|offset=5}} through to {{Fmc4|adjustment=1|offset=5}}
{{#switch:{{If full moon}}
 | 2 = 
 | 1 =* {{Fmc4|adjustment=0|offset=6}} through to {{Fmc4|adjustment=1|offset=6}}
 | 0 = 
}}


Full moon status
The next full moon is from '''{{Fmc4|adjustment=0|offset=0}}''' through to '''{{Fmc4|adjustment=1|offset=0}}''' (UTC)


If full moon
{{ #if: {{{ override|}}}
 |2 <!-- Halloween holiday restriction overridden by Valve -->
 |{{ #ifexpr: {{ #time:U|now }} >= {{ #time:U|{{ Fmc date|adjustment=0|offset=0 }} }} and
  {{ #time:U|{{ Fmc date|adjustment=1|offset=0 }} }} >= {{#time:U|now}}
  |1 <!-- Full moon -->
  |0 <!-- No, past the Full Moon -->
 }}
 |0 <!--No, too early for Full Moon -->
}}

Check halloween status (override):
if last day sep 00:00 - oct 1 11:59 = starting soon
oct 2 00:00 - nov 5 11:59 = halloween
nov 6 00:00 - nov 8 11:59 = ending soon


WIKI PAGE API RETURN:
https://wiki.teamfortress.com/w/api.php?action=parse&page=Full_Moon
BBEdit examination: replace >< with >\n<

REFERENCE LINKS:
https://wiki.teamfortress.com/wiki/Full_Moon
https://wiki.teamfortress.com/wiki/Halloween_event
https://wiki.teamfortress.com/w/index.php?title=Full_Moon&action=edit
https://wiki.teamfortress.com/w/index.php?title=Template:Full_moon_status&action=edit
https://wiki.teamfortress.com/w/index.php?title=Template:If_full_moon&action=edit
https://wiki.teamfortress.com/w/index.php?title=Template:Fmc_date&action=edit
https://wiki.teamfortress.com/w/index.php?title=Template:Fmc4&action=edit
https://wiki.teamfortress.com/w/index.php?title=Template:Age_in_days&action=edit
https://wiki.teamfortress.com/w/index.php?title=Module:Age&action=edit
https://www.mediawiki.org/wiki/Help:Extension:ParserFunctions##time
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getUTCDay

*/