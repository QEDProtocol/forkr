import {exec} from 'tinyexec';
import { waitMs } from './utils';
const FORKR_DATA_DIR = '/app/forkr/';

class DockerManager {
  container: string;

  constructor(container: string) {
    this.container = container;
  }
  async getBitcoinProcessId(): Promise<number> {
    const r = (await this.executeCommand(`ps -ax | grep "bitcoind" | grep "regtest" | awk '{print $1}'`)).trim();
    if (!r.length){
      return -1;
    }
    const v = parseInt(r);
    if (isNaN(v)){
      return -1;
    }
    return v;
  }
  async stopBitcoind(){
    let pid = await this.getBitcoinProcessId();
    if (pid === -1){
      return;
    }
    console.log("stopping bitcoind...");
    await this.executeCommand(`kill ${pid}`);
    while(pid !== -1){
      await waitMs(500);
      pid = await this.getBitcoinProcessId();
    }
    console.log("bitcoind stopped");
  }
  async getElectrsProcessId(): Promise<number> {
    const r = (await this.executeCommand(`ps -ax | grep "electrs" | grep "regtest" | awk '{print $1}'`)).trim();
    if (!r.length){
      return -1;
    }
    const v = parseInt(r);
    if (isNaN(v)){
      return -1;
    }
    return v;
  }
  async stopElectrs(){
    let pid = await this.getElectrsProcessId();
    if (pid === -1){
      return;
    }
    console.log("stopping electrs...");
    await this.executeCommand(`kill ${pid}`);
    while(pid !== -1){
      await waitMs(500);
      pid = await this.getBitcoinProcessId();
    }
    console.log("electrs stopped");
  }
  async getForks(): Promise<string[]> {
    const r = (await this.executeCommand(`cd ${FORKR_DATA_DIR} && ls`)).trim().replace(/\s\n\t+/g, " ").split(" ").map(x=>x.trim()).filter(x=>x.length);
    return r;
  }
  async setupDefaultFork(){
    await this.stopBitcoind();

    const cmd = `rm -rf /app/forkr/ && mkdir -p /app/forkr/default && cp -a /app/.dogecoin/. /app/forkr/default`;
    await this.executeCommand(cmd);
    await this.startBitcoind('default');
  }
  async copyFork(sourceFork: string, destFork: string) {
    await this.stopBitcoind();
    const cmd = `rm -rf /app/forkr/${destFork} && cp -a /app/forkr/${sourceFork}/. /app/forkr/${destFork}`;
    await this.executeCommand(cmd);
  }
  async startBitcoind(forkId: string){
    await this.stopElectrs();
    await this.stopBitcoind();
    console.log("starting bitcoind with fork "+forkId);
    const cmd = `cd /app && bitcoind -regtest -rpcbind=0.0.0.0:18443 -rpcuser=devnet -rpcpassword=devnet -rpcallowip=0.0.0.0/0 -rpcport=18443 -server=1 -txindex=1 -datadir=/app/forkr/${forkId} -zmqpubhashtx=tcp://0.0.0.0:30001 -zmqpubhashblock=tcp://0.0.0.0:30001 -prune=0 >> /app/log/bitcoind 2>&1 & echo $! > /app/bitcoind.pid`;
    await this.executeCommand(cmd);
    console.log("restarting electrs");
    const cmd2 = `rm -rf /app/forkr/electrs_${forkId} && mkdir -p /app/forkr/electrs_${forkId} && cd /app && /app/electrs_bitcoin/bin/electrs -vvvv --timestamp --db-dir=/app/forkr/electrs_${forkId} --daemon-dir=/app/forkr/${forkId} --network regtest --http-addr=0.0.0.0:50000 --electrum-rpc-addr=0.0.0.0:50001 --daemon-rpc-addr=127.0.0.1:18443 --cookie=devnet:devnet --electrum-txs-limit=1000000 --cors=* --utxos-limit=1000000 >> /app/log/electrs 2>&1 & echo $! > /app/electrs.pid`;
    await this.executeCommand(cmd2);

  }
  async executeCommand(command: string) {
     const r = await exec('/usr/local/bin/docker', ['exec', '-i', this.container, '/bin/bash', `-c`, `echo "${btoa(command)}" | base64 -d | /bin/bash`]);
     if(r.stderr) {
       throw new Error(r.stderr);
     }

     return r.stdout;
  }
}

export {
  DockerManager,
  FORKR_DATA_DIR,
}