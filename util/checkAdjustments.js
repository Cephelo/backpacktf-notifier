async function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)) }
const fs = require("fs")
const notifSpamLimit = 3
//const hourLookback = 2
let shiftVals = {
  s: { keys: 0.09, metal: 2 },
  b: { keys: 0.09, metal: 2 }
}

const debugSpam = false
//const deleteSpamNotifs = false
function name(i) { return i.bundle.listing.item.name }

async function setCurrency(a1, a2, num, val) {
  //* DEBUG */ console.log("case:", num, "\na1:", a1, "\na2:", a2)
  let r = "metal"
  try {
    switch (num) {
      case 0: { // 1:N/A, 2:Blanket - get notif currency
        if (a1 == undefined && a2.blanket == 1) r = (val == "keys" ? "keys" : "metal")
        else r = await setCurrency(a1, a2, ++num); break
      }
      case 1: { // 1:NoAlert, 2:Currency - get 2 currency
        if (a1 == undefined && a2.price != undefined) r = a2.price.currency
        else r = await setCurrency(a1, a2, ++num); break
      }
      case 2: {  // 1:Blanket, 2:N/A - get notif currency
        if (a1 != undefined && a1.blanket == 1) r = (val == "keys" ? "keys" : "metal")
        else r = await setCurrency(a1, a2, ++num); break
      }
      case 3: { // 1:Currency, 2:Currency/NoAlert - get 1 currency
        r = a1.price.currency; break
      }
    }
  } catch (e) {
    console.log("Error with setCurrency case", num, ":", e)
    r = await setCurrency(a1, a2, ++num)
  }
  return r
}

async function checkAdjustments(bot, channel) {
  const { getNotifsJson } = require("../util/notif-loop")
  // check for necessary adjustments
  let allNotifs = await getNotifsJson("getAllNotifs", false, 'get', channel, 'notifications?limit=1000', bot)
  if (allNotifs == null) return
  let spamArray = []

  for (let n of allNotifs.results) {
    if (allNotifs.results.filter(e => name(e) == name(n) && e.bundle.listing.intent == n.bundle.listing.intent && (parseInt(e.bundle.listing.listedAt + 3600) > parseInt(Date.now() / 1000) || parseInt(e.bundle.listing.bumpedAt + 3600) > parseInt(Date.now() / 1000))).length > notifSpamLimit) spamArray.push(n)
  }
  const adjustmentsF = fs.readFileSync("./util/logs/adjustments.txt")
  let adjustmentsA = adjustmentsF.toString().split("\n")

  // let delArray = []
  for (let i = spamArray.length - 1; i >= 0; i--) { // remove duplicates (keep newest)
    try {
      const rels = adjustmentsA.filter(e => e.includes(name(spamArray[i])) && e.includes(spamArray[i].bundle.listing.intent))
      let maxrel = 0
      const notifTime = Math.max(parseInt(spamArray[i].bundle.listing.listedAt), parseInt(spamArray[i].bundle.listing.bumpedAt)) * 1000
      for (const i of rels) if (parseInt(i.split(" @ ")[1]) > maxrel) maxrel = parseInt(i.split(" @ ")[1]) // get latest adjustment for item
      /* Debug */ if (debugSpam) console.log(`maxrel: ${maxrel}, notifTime: ${notifTime}, ${notifTime + 1000 < maxrel}; ${rels.includes(e => e.split(" @ ")[0] == spamArray[i].contents.message)}, ${spamArray.filter(e => name(e) == name(spamArray[i])).length}`)
      if (spamArray.filter(e => name(e) == name(spamArray[i])).length > 1 // if spamArray has multiple notifs for the same item
        || rels.includes(e => e.split(" @ ")[0] == spamArray[i].contents.message) // if there's an identical adjustment already
        || notifTime + 1000 < maxrel) { // if the notification came after the most recent adjustment
        // delArray.push(spamArray[i].id)
        spamArray.splice(i, 1);
        if (i + 1 < spamArray.length) ++i
      }
    } catch (e) {
      console.error(e)
      /* Debug */ if (debugSpam) console.log("Errored notif: \n" + JSON.parse(spamArray[i]).toString())
    }
  }

  /* Debug */ if (debugSpam) {
    let r = ""
    for (let i = 0; i < spamArray.length; i++) r += `${i + 1}. "${spamArray[i].contents.message}"\n`
    console.log("spamArray (" + spamArray.length + "): \n" + r)
  }

  let logArray = []
  let imageArray = []
  if (spamArray.length > 0) {
    const alerts = await getNotifsJson("getAlerts-spam", false, 'get', channel, 'classifieds/alerts?limit=10000', bot)
    for (let e of spamArray) {
      let data = {
        name: name(e),
        intent: e.bundle.listing.intent,
        s: { curr: "", min: "", max: "" },
        b: { curr: "", min: "", max: "" }
      }

      const alertS = alerts.results.find(v => v.item_name == data.name && v.intent == "sell")
      const alertB = alerts.results.find(v => v.item_name == data.name && v.intent == "buy")
      const vals = e.bundle.listing.value.short.split(" ") // vals = [value, currency]

      data.s.curr = await setCurrency(alertS, alertB, 0, vals[1])
      data.b.curr = await setCurrency(alertB, alertS, 0, vals[1])

      if (alertS == undefined || alertS.blanket == 1) data.s.min = 0.0001
      else data.s.min = alertS.price.min
      // data.s.min = alertS == undefined ? 0.0001 : alertS.price.min

      data.s.max = (parseFloat(vals[0]) - (!data.s.curr.includes("key") ? shiftVals.s.metal : shiftVals.s.keys)).toFixed(2)
      data.b.min = (parseFloat(vals[0]) + (!data.b.curr.includes("key") ? shiftVals.b.metal : shiftVals.b.keys)).toFixed(2)

      if (alertB == undefined || alertB.blanket == 1) data.b.max = 1000
      else data.b.max = alertB.price.max
      // data.b.max = alertB == undefined ? 1000 : alertB.price.max

      // Check for negative values
      if (data.s.max < 0) data.s.max = (parseFloat(vals[0]) - shiftVals.s.keys).toFixed(2)
      if (data.b.min < 0) data.b.min = (parseFloat(vals[0]) - shiftVals.b.keys).toFixed(2)

      await getNotifsJson("adjustAlertS", false, 'post', channel, `classifieds/alerts?item_name=${encodeURIComponent(data.name)}&intent=sell&currency=${data.s.curr}&min=${data.s.min}&max=${data.s.max}`, bot) // sell alert
      await getNotifsJson("adjustAlertB", false, 'post', channel, `classifieds/alerts?item_name=${encodeURIComponent(data.name)}&intent=buy&currency=${data.b.curr}&min=${data.b.min}&max=${data.b.max}`, bot) // buy alert

      function getData(a) {
        let x; try {
          switch (a) {
            case 1: { x = alertS.price.max; break }
            case 2: { x = alertS.price.currency; break }
            case 3: { x = alertB.price.min; break }
            case 4: { x = alertB.price.currency; break }
          }
        } catch { x = 'N/A' }
        return x
      }
      const imageUrl = e.bundle.listing.item.imageUrl
      imageArray.push(imageUrl.includes('steamcdn') ? imageUrl : `https://backpack.tf${imageUrl}`)
      logArray.push(`${e.contents.message} @ ${Date.now()} @ [S: ${getData(1)} ${getData(2)} -> ${data.s.max} ${data.s.curr}, B: ${getData(3)} ${getData(4)} -> ${data.b.min} ${data.b.curr}]`)
      await delay(500)
    }

    // spamArray.push(deleteSpamNotifs ? delArray.length : 0)
    // if (deleteSpamNotifs) for (const id of delArray) { // delete duplicate notifs
    //   await getNotifsJson("deleteSpamNotifs", false, 'delete', channel, `notifications/${id}`, bot)
    // }

    const adjustmentsFile = fs.readFileSync(`./util/logs/adjustments.txt`)
    fs.writeFileSync('./util/logs/adjustments.txt', `${adjustmentsFile.toString()}\n${logArray.join("\n")}`, (err) => { if (err) console.log(err) })
  }

  // clear adjustment logs more than 24 hours old
  const adjustmentsFile = fs.readFileSync(`./util/logs/adjustments.txt`)
  let adjustments = adjustmentsFile.toString().split("\n")
  for (let log of adjustments) if (log.includes("@") && parseInt(log.split(" @ ")[1]) + 86400000 < Date.now()) adjustments.splice(adjustments.indexOf(log), 1) // removal
  fs.writeFileSync('./util/logs/adjustments.txt', `${adjustments.join("\n")}`, (err) => { if (err) console.log(err) })

  return [logArray, imageArray]
}

module.exports = { checkAdjustments }