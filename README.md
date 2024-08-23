<img src= "./static/forkr-logo.png" height="300" alt="Forkr"/>


# Forkr
An easy to use tool for simulating forks/re-orgs on Bitcoin and Dogecoin


## Why is the useful
For ordinals and other inscription based applications where sequence of inscriptions matter, it is crucial that indexers are able to handle forks in the Bitcoin/Dogecoin blockchains (millions of dollars are on the line).

### If you don't handle forks/re-orgs correctly, people will end up with incorrect balances and double spends.

<img src= "./static/bad-time.png" height="280" alt="if you don't handle forks/re-orgs correctly, your gonna have a bad time" />


## Getting Started
First you will want to install `docker` and `npm`, then start either a BitIDE Bitcoin or BitIDE Dogecoin docker container:

### Bitcoin
```bash
docker run -p 1337:1337 -it --rm qedprotocol/bitide:latest
```

### Dogecoin
```bash
docker run -p 1337:1337 -it --rm qedprotocol/bitide-doge:latest
```

The docker container will start the following services:
- A Bitcoin/Dogecoin Regtest node ready for development
- A Bitcoin/Dogecoin RPC API running at http://devnet:devnet@127.0.0.1:1337/bitcoin-rpc/
- A Block Explorer running at http://127.0.0.1:1337/explorer/
- An Electrs full history API running at http://127.0.0.1:1337/api/

Next run:
```bash
docker ps
```

And you should see something like:
```
CONTAINER ID   IMAGE                         COMMAND                  
a9fa22996770   qedprotocol/bitide:latest     "bash /app/start.sh"
```
The 12 hexadecimal characters at the start (in this case, "a9fa22996770") is your **container id**


To start Forkr, just run
```bash
git clone https://github.com/QEDProtocol/forkr
cd forkr
npm install
npm run start [YOUR_CONTAINER_ID]
```

So in the case of the previous example I would run:
```bash
npm run start a9fa22996770
```


## Using Forkr

At startup, Forkr creates a fork of the current chain called `default`.
To create a a resumable copy of a chain at a given point, send an HTTP get request to:
```text
curl http://localhost:1449/createfork/<name of your new fork>?source=<source of the fork>&activate=<1 or 0, depending on if you want to activate it>
````

To activate a forked chain, send an HTTP get request to:
```bash
curl http://localhost:1449/activatefork/<name of the fork you want to activate>
```

To view thes status of Forkr, send an HTTP get request to:
```bash
curl https://localhost:1449/status
```

## Tutorial

### Creating our first forks
Let's create two forks of the default chain, **fork1** and **fork2**:
```bash
curl "http://localhost:1449/createfork/fork1?source=default&activate=1"
```
```bash
curl "http://localhost:1449/createfork/fork2?source=default&activate=1"
```

Next, let's check the status of forker by running:
```bash
curl "http://localhost:1449/status"
```
We should see something like the following:
```json
{"forks":["default","fork1","fork2"],"currentFork":"fork2","isBusy":false,"rpcIsDisabled":false,"rpcIsRunning":true}
```
As we can see ```currentFork``` is ```fork2```, lets switch back to **fork1**:
```bash
curl "http://localhost:1449/activatefork/fork1"
```

<br />
<br />

### Generating divergent blocks on fork1 and fork2
Now that we are on fork1, we can make some transactions using the RPC endpoint http://devnet:devnet@127.0.0.1:1337/bitcoin-rpc/, and we can check them out in the block explorer at http://localhost:1337/explorer/.

These transactions can be ordinal inscriptions/other transactions relevant to your indexer.


Once we've made some transactions, we can switch over to `fork2` by running:
```bash
curl "http://localhost:1449/activatefork/fork2"
```

If we now refresh the block explorer, the new transactions we have made will not be there (fork2 will currently be back at the tip of the `default` fork).

We can now make some transactions on fork2 (Again, these transactions should be ordinal inscriptions/other transactions relevant to your indexer). 
For the best simulation of real forking activity, lets mine more blocks than we did on fork1 so it has a higher block height.


<br />
<br />


### Testing your indexer
Let's switch back to fork1 now:
```bash
curl "http://localhost:1449/activatefork/fork1"
```

Now, you can startup your indexer and index based on fork1 (use jsonrpc-import for txindex based indexers/other RPC-compatible indexers).


In a re-org/fork, an active chain state is superseceded by a longer chain of valid blocks which does not include previously confirmed/indexed blocks.

Since fork2 has a longer chain of valid blocks that don't include some of fork1's transactions, let's test our indexer's ability to handle a re-org by switching to fork2:
```bash
curl "http://localhost:1449/activatefork/fork2"
```

Now check your indexer and see if it handled the re-org correctly =) 🎉



<br />
<br />

## License
Copyright 2024 QED

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.