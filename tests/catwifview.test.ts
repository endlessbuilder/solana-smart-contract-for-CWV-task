import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { Catwifview } from '../target/types/catwifview'
import { Connection, Keypair, PublicKey } from '@solana/web3.js'
import CatwifviewImpl from './integration'
import * as utils from './utils'
import { createMint, mintTo } from '@solana/spl-token'
import { TOKEN_A_DECIMAL, TOKEN_CWV_DECIMAL, TREASURY } from './integration/constants'

describe('catwifview', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)
  const wallet = provider.wallet as anchor.Wallet
  const payer = wallet.payer
  const program = anchor.workspace.Catwifview as Program<Catwifview>
  // const connection = program.provider.connection
  const connection = new Connection('http://127.0.0.1:8899', 'finalized')

  let catwifview: CatwifviewImpl = new CatwifviewImpl(program, connection)

  const adminKeypair = Keypair.generate()
  const userKeypair = Keypair.generate()

  let adminPubkey = adminKeypair.publicKey
  let adminATokenAccount: PublicKey
  let adminCwvTokenAccount: PublicKey
  let userPubkey = userKeypair.publicKey
  let userATokenAccount: PublicKey
  let userCwvTokenAccount: PublicKey

  let tokenAMint: PublicKey
  let tokenCwvMint: PublicKey

  it('set up!', async () => {
    // airdrop sol for simulation
    await utils.airDropSol(connection, adminPubkey)
    console.log(
      `<<< payer bal = ${await utils.getSolBalance(
        connection,
        payer.publicKey
      )}`
    )
    await utils.airDropSol(connection, adminPubkey)
    console.log(
      `<<< admin bal = ${await utils.getSolBalance(connection, adminPubkey)}`
    )
    await utils.airDropSol(connection, userPubkey)
    console.log(
      `<<< user bal = ${await utils.getSolBalance(connection, userPubkey)}`
    )

    // create mint of Token A token
    try {
      tokenAMint = await createMint(
        connection,
        payer,
        payer.publicKey,
        null,
        TOKEN_A_DECIMAL
      )
      console.log(
        '>>> ! check ! A TokenMintPubkey = ',
        await utils.checkAccountValidity(connection, tokenAMint)
      )
    } catch (e) {
      console.log('>>> A token createMint error # \n ', e)
    }

    // get Token A ATA of user
    userATokenAccount = await utils.getOrCreateATA(
      connection,
      tokenAMint,
      userPubkey,
      userKeypair
    )
    console.log(
      '<<< user A Token Account Pubkey = ',
      userATokenAccount.toBase58()
    )
    await mintTo(
      connection,
      payer,
      tokenAMint,
      userATokenAccount,
      payer,
      utils.toTokenAmount(20, TOKEN_A_DECIMAL).toNumber()
    )
    console.log(
      '<<< user A token balance = ',
      await utils.getBalance(connection, userATokenAccount)
    )
    // get Token A ATA of admin
    adminATokenAccount = await utils.getOrCreateATA(
      connection,
      tokenAMint,
      adminPubkey,
      adminKeypair
    )
    console.log(
      '<<< admin A Token Account Pubkey = ',
      adminATokenAccount.toBase58()
    )
    await mintTo(
      connection,
      payer,
      tokenAMint,
      adminATokenAccount,
      payer,
      utils.toTokenAmount(20, TOKEN_A_DECIMAL).toNumber()
    )
    console.log(
      '<<< admin A token balance = ',
      await utils.getBalance(connection, adminATokenAccount)
    )
    // create mint of CWV token
    try {
      tokenCwvMint = await createMint(
        connection,
        payer,
        payer.publicKey,
        null,
        TOKEN_CWV_DECIMAL
      )
      console.log(
        '>>> ! check ! CWV TokenMintPubkey = ',
        await utils.checkAccountValidity(connection, tokenCwvMint)
      )
    } catch (e) {
      console.log('>>> CWV token createMint error # \n ', e)
    }

    // get CWV ATA of user
    userCwvTokenAccount = await utils.getOrCreateATA(
      connection,
      tokenCwvMint,
      userPubkey,
      userKeypair
    )
    console.log(
      '<<< user CWV token Account Pubkey = ',
      userCwvTokenAccount.toBase58()
    )
    await mintTo(
      connection,
      payer,
      tokenCwvMint,
      userCwvTokenAccount,
      payer,
      utils.toTokenAmount(20, TOKEN_CWV_DECIMAL).toNumber()
    )
    console.log(
      '<<< user CWV token balance = ',
      await utils.getBalance(connection, userATokenAccount)
    )
    // get Token A ATA of admin
    adminCwvTokenAccount = await utils.getOrCreateATA(
      connection,
      tokenCwvMint,
      adminPubkey,
      adminKeypair
    )
    console.log(
      '<<< admin CWV Token Account Pubkey = ',
      adminCwvTokenAccount.toBase58()
    )
    await mintTo(
      connection,
      payer,
      tokenCwvMint,
      adminCwvTokenAccount,
      payer,
      utils.toTokenAmount(20, TOKEN_CWV_DECIMAL).toNumber()
    )
    console.log(
      '<<< admin CWV token balance = ',
      await utils.getBalance(connection, adminCwvTokenAccount)
    )
  })
})
