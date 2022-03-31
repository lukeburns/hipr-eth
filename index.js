const { util, wire, Zone } = require('bns')
const { BufferReader } = require('bufio')
const Ethereum = require('./ethereum')
const { types } = wire

const empty = new Zone()

let ready = false
const handleInit = () => {
  ready = true
  console.log('[eth] initialized')
}
const handleError = err => {
  while (err.error) { err = err.error }
  err = ((err.message || '').split(':').slice(-1)[0] || '').trim()
  console.log(`[eth] failed to initialize : ${err} (retrying in 10s)`)

  // retry every 10s
  setTimeout(() => {
    ethereum.init().then(handleInit).catch(handleError)
  }, 10000)
}
const ethereum = new Ethereum()
ethereum.init().then(handleInit).catch(handleError)

module.exports = middleware

function middleware () { 
  return {
    hostname: ':data.:protocol(_eth|eth).:gateway?.', 
    handler: async function ({ protocol, data: hip5data }, name, type, res, rc, ns) {
      type = types[type]

      if (!ready) {
        console.log('[eth] waiting for ethers to initialize')
        const res = empty.resolve(name, types[type]);
        res.code = codes.SERVFAIL; // ensure response not cached
        return res;
      }

      const labels = util.split(name)
      if (protocol === 'eth') {
        const data = await ethereum.resolveDnsFromEns(name, type)
        if (data && data.length > 0) {
          return sendData(data, type)
        }
      }

      if (protocol === 'eth') {
        data = await ethereum.resolveDnsFromEns(name, type, hip5data+'.eth')
      } else if (protocol === '_eth') {
        data = await ethereum.resolveDnsFromAbstractEns(name, type, hip5data)
      }

      if (!data || data.length === 0) {
        return empty.resolve(name, type)
      }

      return sendData(data, type)
    }
  }
}

function sendData (data, type) {
  const res = new wire.Message()
  res.aa = true
  const br = new BufferReader(data)
  while (br.left() > 0) {
    res.answer.push(wire.Record.read(br))
  }

  // todo: sign properly
  // // Answers resolved from alternate name systems appear to come directly
  // // from the HNS root zone.
  // this.ns.signRRSet(res.answer, type)

  // if (type !== wire.types.CNAME) {
  //   this.ns.signRRSet(res.answer, wire.types.CNAME)
  // }

  return res
}
