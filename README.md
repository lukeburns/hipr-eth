# ETH Middleware

## Usage

`hipr-eth` is [hipr](https://github.com/lukeburns/hipr) middleware. 

if you don't have [hipr](https://github.com/lukeburns/hipr) installed, run
```
npm i -g hipr
```
then you can install the `hipr-eth` middleware
```
hipr install hipr-eth
```
and spin up a server (assuming you have an `hsd`/`hnsd` root server listening on port 5349)
```
hipr hipr-eth :5333 :5349
```

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