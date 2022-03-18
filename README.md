# ETH Middleware

## Usage

`hipr-eth` is [hipr](https://github.com/lukeburns/hipr) middleware that resolves names from Ethereum using light client.

if you don't have [hipr](https://github.com/lukeburns/hipr) installed, run
```
npm i -g hipr
```

if you don't have a local ethereum light node running, install [`geth`](https://ethereum.org/en/developers/tutorials/run-light-node-geth/) and start a light node on port 8545
```
geth --syncmode "light" --http
```

once the light client is synced, install the `hipr-eth` middleware
```
hipr install hipr-eth
```
then spin up a server (assuming you have an `hsd`/`hnsd` root server listening on port 5349)
```
hipr hipr-eth :5333 :5349
```

now you can resolve trustlessly from ethereum!

## Example

You can test that hipr is resolving properly by running
```
> dig @127.0.0.1 -p 5333 humbly.eth +short
184.73.82.1
```
or
```
> dig @127.0.0.1 -p 5333 certified.badass +short
184.73.82.1
```