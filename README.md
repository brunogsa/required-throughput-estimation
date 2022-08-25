# Queue delay estimation

## Given

- The amount of requests that arrive per minute
- The amount of requests handled per minute
- The maximum tolerable waiting time, in minutes
- The amount of minutes that new requests keep arriving

## Calculate

- The minimum required throughput, in requests per minute, to acommodate the waiting time
- The estimated max and average waiting time, in minutes

## How to

See below a list of technologies to install and configure:

- node 14+

Make sure you are using the compatible versions:

```sh
$ node -v
```

Edit the parameters on `index.js`, then execute:

```sh
$ node index.js
```
