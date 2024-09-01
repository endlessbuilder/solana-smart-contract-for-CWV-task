import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { Catwifview } from '../target/types/catwifview'
import { Keypair } from '@solana/web3.js'

describe('catwifview', () => {
  const adminKeypair = Keypair.generate()
  const userKeyparit = Keypair.generate()

  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env())

  const program = anchor.workspace.Catwifview as Program<Catwifview>

  // const connection = new Connection(ANKR_MAINNET, {
  //   wsEndpoint: ANKR_MAINNET_WS,
  //   commitment: 'finalized'
  // })
  // const provider = new AnchorProvider(connection, new Wallet(adminKeypair))
  // const program = new Program<Middleman>(idl as any, provider)

  it('Is initialized!', async () => {
    
  })
})
