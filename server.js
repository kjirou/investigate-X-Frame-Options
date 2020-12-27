const express = require('express')

const buildAbsoluteUrlFromRequest = (req) => {
  // Could not find this logic anywhere in Node.js built-ins or express methods.
  // Ref) https://stackoverflow.com/questions/10183291/how-to-get-the-full-url-in-express
  return `${req.protocol}://${req.get('host')}${req.originalUrl}`
}

const browsedPortArg = process.argv[2]
if (browsedPortArg === undefined) {
  throw new Error('Specify a browsed site port as the first argument.')
}
const browsedPort = parseInt(browsedPortArg)

const embeddedPortArg = process.argv[3]
if (embeddedPortArg === undefined) {
  throw new Error('Specify an embedded site port as the second argument.')
}
const embeddedPort = parseInt(embeddedPortArg)

const app = express()

app.get('/none', function (req, res) {
  res.set({
    'Cache-Control': 'no-store',
  })
  res.send(buildAbsoluteUrlFromRequest(req))
})
app.get('/sameorigin', function (req, res) {
  res.set({
    'X-Frame-Options': 'SAMEORIGIN',
    'Cache-Control': 'no-store',
  })
  res.send(buildAbsoluteUrlFromRequest(req))
})
app.get('/deny', function (req, res) {
  res.set({
    'X-Frame-Options': 'DENY',
    'Cache-Control': 'no-store',
  })
  res.send(buildAbsoluteUrlFromRequest(req))
})
app.get('/', function (req, res) {
  const notSameoriginNoneUrl = `http://localhost:${embeddedPort}/none`
  const notSameoriginSameoriginUrl = `http://localhost:${embeddedPort}/sameorigin`
  const notSameoriginDenyUrl = `http://localhost:${embeddedPort}/deny`
  const html = `<html><body>
  <p>${buildAbsoluteUrlFromRequest(req)} here.</p>
  <h2>None X-Frame-Options</h2>
  <iframe src="${notSameoriginNoneUrl}"></iframe>
  <h2>X-Frame-Options: SAMEORIGIN;</h2>
  <iframe src="${notSameoriginSameoriginUrl}"></iframe>
  <h2>X-Frame-Options: DENY;</h2>
  <iframe src="${notSameoriginDenyUrl}"></iframe>
  </body></html>`
  res.set({
    'Content-Type': 'text/html',
    'Cache-Control': 'no-store',
  })
  res.send(html)
})

app.listen(browsedPort, () => {
  console.log(`Listening on ${browsedPort} port.`)
})
app.listen(embeddedPort, () => {
  console.log(`Listening on ${embeddedPort} port.`)
})