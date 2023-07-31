var http = require("http")
var request = require("request");
async function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)) }

/* Debug */
const logMonitors = false
const logMonitorStatus = false
const logNewMonitor = false
const logEditMonitor = false

async function createServer(host) {
  http.createServer(function(req, res) {
    res.write(`I'm running!  Here I am: https://replit.com/@${process.env.REPL_OWNER}/${process.env.REPL_SLUG}`)
    res.end()
  }).listen(8080)
  console.log(`Webserver online!\nServer running at ${host}`)

  console.log(`Just in case, here's your UTR dashboard: https://uptimerobot.com/dashboard.php#mainDashboard`)
  for (let i = 0; i < Number.MAX_SAFE_INTEGER; i++) {
    checkMonitor(i, host)
    await delay(600000) // Every 10 Minutes
  }
}

async function checkMonitor(i, host) {
  let hasMonitor = false
  const mons = await getMonitors()
  /* Debug */ if (logMonitors) console.log(mons)
  try {
    if (mons.monitors.length > 0) for (const mon of mons.monitors) if (mon.url == host) {
      if (i == 0) console.log("Uptime monitor verified successfully!"); hasMonitor = mon
    }
  } catch (e) { console.error(`[${Date.now()}] Error: ${e}`) }

  if (hasMonitor != false) {
    /* Debug */ if (hasMonitor.status != 1 && hasMonitor.status != 2 || logMonitorStatus) console.log(`[${Date.now()}] Monitor status: ${hasMonitor.status} (${statusMessage(hasMonitor.status)}) (#${i + 1})`)
    if (hasMonitor.status != 1 && hasMonitor.status != 2) {
      console.log(`${hasMonitor.status == 0 ? 'Un' : 'Error detected, '}pausing monitor.`)
      updateMonitor(hasMonitor, false, host)
    }
  } else {
    console.log('No uptime monitor detected, attempting to create...')
    updateMonitor(hasMonitor, true, host)
  }
}

async function getMonitors() {
  const fetchJson = await fetch(`https://api.uptimerobot.com/v2/getMonitors?format=json&api_key=${process.env.UPTIME_ACCOUNT_API_KEY}`, { method: 'POST' }
  ).then((response) => {
    if (!response.ok) {
      console.log(`Error ${response.status}: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/${response.status}`)
      throw new Error(`[${Date.now()}] HTTP error! (getMonitors) Status: ${response.status}`);
    }
    return response
  }).catch(err => console.error(`[${Date.now()}] ${err}`))
  try {
    return await fetchJson.json()
  } catch (error) {
    console.log(`[${Date.now()}] Error parsing JSON:`)
    console.error(error)
    return undefined
  }
}

function statusMessage(status) {
  switch (status) {
    case 0: return 'Paused'
    case 1: return 'Waiting'
    case 2: return 'Up'
    case 8: return 'Seems Down?'
    case 9: return 'Down'
    default: return 'Unknown'
  }
}

function updateMonitor(monitor, createNew, host) {
  const formObj = !createNew ? {
    api_key: process.env.UPTIME_ACCOUNT_API_KEY,
    format: 'json',
    id: monitor.id,
    status: monitor.status == 0 ? 1 : 0
  } : {
    api_key: process.env.UPTIME_ACCOUNT_API_KEY,
    format: 'json',
    type: '1',
    url: host,
    friendly_name: `BPTFNotifs-${Date.now()}`,
  }
  var options = {
    method: 'POST',
    url: `https://api.uptimerobot.com/v2/${createNew ? 'new' : 'edit'}Monitor`,
    headers:
    {
      'content-type': 'application/x-www-form-urlencoded',
      'cache-control': 'no-cache'
    },
    form: formObj
  }
  request(options, function(error, response, body) {
    if (error) throw new Error(error)
      /* Debug */ if ((createNew ? logNewMonitor : logEditMonitor)) console.log(body);
  })
}
module.exports = { createServer }