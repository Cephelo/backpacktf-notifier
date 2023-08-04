var http = require("http")
const fs = require("fs")
async function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)) }
const logHTTPRequests = false

async function createServer(host) {
  await writeFile(true, 'Restarting!')
  http.createServer(function(req, res) {
    writeFile(false, req)
    res.write(`I'm running!  Here I am: https://replit.com/@${process.env.REPL_OWNER}/${process.env.REPL_SLUG}`)
    res.end()
  }).listen(8080)
  console.log(`Webserver online!  Running at ${host}`)
  for (let i = 0; i < Number.MAX_SAFE_INTEGER; i++) {
    checkHTTPKARepl(host)
    await delay(300000) // Every 5 Minutes
  }
}

async function writeFile(starting, req) {
  if (logHTTPRequests) {
    let log = ''
    if (fs.existsSync('./util/http-log.txt')) log = fs.readFileSync(`./util/http-log.txt`)
    const now = new Date(Date.now())
    if (starting) fs.writeFileSync('./util/http-log.txt', `${log}[${now.toTimeString().substr(0, 8)} ${now.toDateString().split(' 202')[0]}] ${req}\n`, (err) => { if (err) console.log(err) })
    else {
      let header = req.rawHeaders[req.rawHeaders.indexOf('User-Agent') + 1]
      fs.writeFileSync('./util/http-log.txt', `${log}[${now.toTimeString().substr(0, 8)} ${now.toDateString().split(' 202')[0]}] ${req.method} ${header}\n`, (err) => { if (err) console.log(err) })
    }
  }
}

async function checkHTTPKARepl(host) {
  if (logHTTPRequests) console.log('Ping sent!')
  const fetchJson = await fetch('http://http-keepalive.cephelo.repl.co', { method: 'POST', body: host, headers: { "Content-Type": "text/plain" } }
  ).then((response) => {
    if (!response.ok) {
      console.log(`Error ${response.status}: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/${response.status}`)
      throw new Error(`[${Date.now()}] HTTP error! Status: ${response.status}`);
    }
    return response
  }).catch(err => console.error(`[${Date.now()}] ${err}`))
}

module.exports = { createServer, writeFile }