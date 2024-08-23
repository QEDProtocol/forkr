import { DockerManager } from "./docker";
import { IForkedBlockchainState } from "./types";

const DEFAULT_FORK_STATE: IForkedBlockchainState = {
  datadir: '/app/forkr/default',
  slug: 'default',
  parent: '',
  block_hash: '',
  block_number: 0,
};

class ForkrBackendState {
  forks: string[] = ["default"];
  currentFork: string = "default";
  isBusy: boolean = false;
  rpcIsRunning: boolean = true;
  docker: DockerManager = new DockerManager("");
  dockerActivated = false;
  rpcIsDisabled = false;

  constructor() {
  }
  async activateDocker(container: string) {
    if(this.dockerActivated) {
      return;
    }
    this.isBusy = true;
    this.docker = new DockerManager(container);
    this.dockerActivated = true;
    this.rpcIsRunning = true;
    await this.docker.setupDefaultFork();
    this.isBusy = false;

  }
  async activateFork(fork: string) {
    if(this.currentFork === fork) {
      return;
    }
    if(this.isBusy){
      throw new Error("Busy");
    }
    if(!this.forks.includes(fork)){
      throw new Error("Fork not found");
    }
    this.isBusy = true;
    await this.docker.stopBitcoind();
    await this.docker.startBitcoind(fork);
    this.currentFork = fork;
    this.isBusy = false;
  }
  async createFork(sourceFork: string, newFork: string, activate = false) {
    if(this.forks.includes(newFork)){
      throw new Error("fork already exists");
    }
    if(!this.forks.includes(sourceFork)){
      throw new Error("source fork does not exist");
    }
    const rpcRunning = this.rpcIsRunning;
    if(this.isBusy){
      throw new Error("Busy");
    }
    this.isBusy = true;
    this.rpcIsRunning = false;
    await this.docker.stopBitcoind();
    await this.docker.copyFork(sourceFork, newFork);
    this.rpcIsRunning = rpcRunning;
    this.forks.push(newFork);
    this.isBusy = false;
    if(activate){
      await this.activateFork(newFork);
    }
    this.isBusy = false;
  }
}


const FORKR_STATE = new ForkrBackendState();

export {
  ForkrBackendState,
  FORKR_STATE,
}