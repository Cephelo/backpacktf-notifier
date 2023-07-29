var http = require("http")
var request = require("request");
const logMonitors = false
const logNewMonitor = false
const host = `http://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`
async function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)) }

async function createServer() {
  http.createServer(function(req, res) {
    res.writeHead(301, { Location: 'https://replit.com' })
    res.end()
  }).listen(8080)
  console.log(`Webserver online!\nServer running at ${host}`)

  console.log(`Just in case, here's your UTR dashboard: https://uptimerobot.com/dashboard.php#mainDashboard`)
  let hasMonitor = await getMonitors()
  if (!hasMonitor) {
    console.log('No uptime monitor detected, attempting to create...')
    var options = {
      method: 'POST',
      url: 'https://api.uptimerobot.com/v2/newMonitor',
      headers:
      {
        'content-type': 'application/x-www-form-urlencoded',
        'cache-control': 'no-cache'
      },
      form:
      {
        api_key: process.env.UPTIME_ACCOUNT_API_KEY,
        format: 'json',
        type: '1',
        url: host,
        friendly_name: `BPTFNotifs-${Date.now()}`
      }
    }

    const returnedBody = request(options, function(error, response, body) {
      if (error) throw new Error(error)
      return body
    })
    /* Debug */ if (logNewMonitor) console.log(returnedBody);
    await delay(2000)
    let checkForMonitor = await getMonitors()
    if (!checkForMonitor) {
      console.log('Could not verify monitor.  Stopping!')
      process.exit(0)
    }
  }
}

async function getMonitors() {
  const monitors = await getJson('getMonitors', '')
  /* Debug */ if (logMonitors) console.log(monitors)
  try {
    if (monitors.monitors.length > 0) {
      for (const mon of monitors.monitors) {
        if (mon.url == host) {
          console.log("Uptime monitor verified successfully!")
          return true
        }
      }
    } else return false
  } catch (e) {
      console.error(`[${Date.now()}] Error: ${e}`)
  }
  return false
}

async function getJson(method, args) {
  const fetchJson = await fetch(`https://api.uptimerobot.com/v2/${method}?format=json&api_key=${process.env.UPTIME_ACCOUNT_API_KEY}${args}`, { method: 'POST' }
  ).then((response) => {
    if (!response.ok) {
      console.log(`Here's what ${response.status} means:https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/${response.status}`)
      throw new Error(`[${Date.now()}] HTTP error! (getMonitors) Status: ${response.status}`);
    }
    return response;
  }).catch(err => console.error(`[${Date.now()}] ${err}`))
  try {
    return await fetchJson.json()
  } catch (error) {
    console.log(`[${Date.now()}] Error parsing JSON:`)
    console.error(error)
    return undefined
  }
}
module.exports = { createServer }