import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { Catwifview } from '../target/types/catwifview'
import { Connection, Keypair, PublicKey } from '@solana/web3.js'
import CatwifviewImpl from './integration'
import * as utils from './utils'

describe('catwifview', () => {
  const adminKeypair = Keypair.generate()
  const userKeypair = Keypair.generate()

  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)
  const payer = provider.wallet as anchor.Wallet
  const program = anchor.workspace.Catwifview as Program<Catwifview>
  // const connection = program.provider.connection
  const connection = new Connection('http://127.0.0.1:8899', 'finalized')

  let catwifview: CatwifviewImpl = new CatwifviewImpl(program, connection)

  let adminPubkey = adminKeypair.publicKey
  let userPubkey = userKeypair.publicKey
  let userATokenAccount: PublicKey
  let userCwvTokenAccount: PublicKey

  let tokenAMint: PublicKey
  let tokenCwvMint: PublicKey

  it('set up!', async () => {
    await utils.airDropSol(connection, adminPubkey)
    console.log(
      `<<< payer bal = ${await utils.getSolBalance(
        connection,
        payer.publicKey
      )}`
    )
    await utils.airDropSol(connection, adminPubkey)
    console.log(
      `<<< admin bal = ${await utils.getSolBalance(
        connection,
        adminPubkey
      )}`
    )
  })
})
