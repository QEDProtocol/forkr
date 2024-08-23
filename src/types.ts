interface IForkedBlockchainState {
  parent: string;
  slug: string;
  datadir: string;
  block_number: number;
  block_hash: string;
}

export type {
  IForkedBlockchainState,
}