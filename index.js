const { util, wire, Zone } = require('bns');
const { BufferReader } = require('bufio');
const Ethereum = require('./ethereum');
const { types, typesByVal } = wire;

const empty = new Zone();

let ready = false;
const handleInit = () => {
  ready = true;
  console.log('[eth] initialized');
};
const handleError = err => {
  while (err.error) { err = err.error; }
  err = ((err.message || '').split(':').slice(-1)[0] || '').trim();
  console.log(`[eth] failed to initialize : ${err} (retrying in 10s)`);

  // retry every 10s
  setTimeout(() => {
    ethereum.init().then(handleInit).catch(handleError);
  }, 10000);
};
const ethereum = new Ethereum();
ethereum.init().then(handleInit).catch(handleError);

module.exports = middleware;

function middleware () {
  // ethereum.resolveDnsFromAbstractEns('eskimo.forever.', types.A, `._eth.`)
  return {
    hostname: ':data.:protocol(_eth|eth).:gateway?.',
    handler: async function ({ protocol, data: hip5data }, name, type, res, rc, ns) {
      type = types[type];

      if (!ready) {
        console.log('[eth] waiting for ethers to initialize');
        const res = empty.resolve(name, types[type]);
        res.code = codes.SERVFAIL; // ensure response not cached
        return res;
      }

      let data;
      if (protocol === 'eth') {
        data = await ethereum.resolveDnsFromEns(name, type, `${hip5data}.eth.`);
      } else if (protocol === '_eth') {
        data = await ethereum.resolveDnsFromAbstractEns(name, type, `${hip5data}._eth.`);
        console.log('[eth]', name, typesByVal[type], `${hip5data}._eth.\n`, sendData(data).toString());
      }

      if (!data || data.length === 0) {
        return empty.resolve(name, type);
      }

      return sendData(data, type);
    }
  };
}

function sendData (data, type) {
  const res = new wire.Message();
  // res.aa = true;
  const br = new BufferReader(data);
  while (br.left() > 0) {
    const rr = wire.Record.read(br);
    if (rr.type === wire.types.NS) {
      res.authority.push(rr);
    } else if (rr.type === type || rr.type === wire.types.CNAME) {
      res.answer.push(rr);
    } else {
      res.authority.push(rr);
    }
  }

  // Referral answer
  // if (res.answer.length === 0 && res.authority.length > 0) {
  //   res.aa = false;
  //   // this.ns.signRRSet(res.authority, wire.types.DS);
  // }

  // Answers resolved from alternate name systems appear to come directly
  // from the HNS root zone.
  // this.ns.signRRSet(res.answer, type);

  // if (type !== wire.types.CNAME)
  // this.ns.signRRSet(res.answer, wire.types.CNAME);

  return res;
}
