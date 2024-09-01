import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { Catwifview } from '../target/types/catwifview'
import {
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction
} from '@solana/web3.js'
import CatwifviewImpl from './integration'
import * as utils from './utils'
import { createMint, mintTo } from '@solana/spl-token'
import {
  TOKEN_A_DECIMAL,
  TOKEN_CWV_DECIMAL,
  TREASURY
} from './integration/constants'
import { assert } from 'chai'

describe('catwifview', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)
  const wallet = provider.wallet as anchor.Wallet
  const payer = wallet.payer
  const program = anchor.workspace.Catwifview as Program<Catwifview>
  console.log('programId ', program.programId.toBase58())
  // const connection = program.provider.connection
  const connection = new Connection('http://127.0.0.1:8899', 'finalized')

  let catwifview: CatwifviewImpl = new CatwifviewImpl(program, connection)

  const userKeypair = Keypair.generate()

  let payerPubkey: PublicKey = payer.publicKey
  let payerATokenAccount: PublicKey
  let payerCwvTokenAccount: PublicKey
  let userPubkey: PublicKey = userKeypair.publicKey
  let userATokenAccount: PublicKey
  let userCwvTokenAccount: PublicKey

  let tokenAMint: PublicKey
  let tokenCwvMint: PublicKey

  it('set up!', async () => {
    // airdrop sol for simulation
    await utils.airDropSol(connection, payerPubkey)
    console.log(
      `<<< payer bal = ${await utils.getSolBalance(connection, payerPubkey)}`
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
      // console.log(
      //   '>>> ! check ! A TokenMintPubkey = ',
      //   await utils.checkAccountValidity(connection, tokenAMint)
      // )
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
    // get Token A ATA of payer
    payerATokenAccount = await utils.getOrCreateATA(
      connection,
      tokenAMint,
      payerPubkey,
      payer
    )
    console.log(
      '<<< payer A Token Account Pubkey = ',
      payerATokenAccount.toBase58()
    )
    await mintTo(
      connection,
      payer,
      tokenAMint,
      payerATokenAccount,
      payer,
      utils.toTokenAmount(20, TOKEN_A_DECIMAL).toNumber()
    )
    console.log(
      '<<< payer A token balance = ',
      await utils.getBalance(connection, payerATokenAccount)
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
      // console.log(
      //   '>>> ! check ! CWV TokenMintPubkey = ',
      //   await utils.checkAccountValidity(connection, tokenCwvMint)
      // )
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
    // get Token A ATA of payer
    payerCwvTokenAccount = await utils.getOrCreateATA(
      connection,
      tokenCwvMint,
      payerPubkey,
      payer
    )
    console.log(
      '<<< payer CWV Token Account Pubkey = ',
      payerCwvTokenAccount.toBase58()
    )
    await mintTo(
      connection,
      payer,
      tokenCwvMint,
      payerCwvTokenAccount,
      payer,
      utils.toTokenAmount(20, TOKEN_CWV_DECIMAL).toNumber()
    )
    console.log(
      '<<< payer CWV token balance = ',
      await utils.getBalance(connection, payerCwvTokenAccount)
    )
  })

  it('initialize treasury & token vaults', async () => {
    try {
      let tx = await catwifview.initializeTreasury(
        payer.publicKey, //payer
        tokenCwvMint, //CWV token mint
        tokenAMint // Token A mint
      )

      let txId = await sendAndConfirmTransaction(connection, tx, [payer])

      console.log('>>> initializeTreasury & tokenVaults txId = ', txId)
    } catch (e) {
      console.log('>>> initializeTreasury & tokenVaults error # \n ', e)
      assert(false, 'initializeTreasury & tokenVaults error')
    }

    let treasury = catwifview.getTreasury()
    let fetchedTreasury = await program.account.treasury.fetch(treasury)

    // console.log(
    //   `>>> payer : ${payerPubkey.toBase58()} == set admin : ${fetchedTreasury.admin.toBase58()}`
    // )

    assert.equal(
      payerPubkey.toBase58(),
      fetchedTreasury.admin.toBase58(),
      'admin does not be set correctly'
    )
    assert.equal(
      tokenCwvMint.toBase58(),
      fetchedTreasury.tokenCwvMint.toBase58(),
      'CWV token mint does not be set correctly'
    )
    assert.equal(
      tokenAMint.toBase58(),
      fetchedTreasury.tokenAMint.toBase58(),
      'Token A token mint does not be set correctly'
    )
  })

  it('depositCwvToken', async () => {
    let preTokenBal = await utils.getBalance(
      connection,
      catwifview.getTokenCwvAccount()
    )

    let depositAmount = utils.toTokenAmount(10, TOKEN_CWV_DECIMAL)
    try {
      let { txId } = await catwifview.depositCwvToken(
        depositAmount, // amount

        payerPubkey, // depositor
        payerPubkey, // admin
        payerCwvTokenAccount // depositorCwvTokenAccount
      )
      console.log('>>> depositCwvToken txId = ', txId)
    } catch (e) {
      console.log('>>> depositCwvToken error # \n ', e)
      assert(false, 'depositCwvToken error')
    }

    let expectedTokenBal = new anchor.BN(preTokenBal).add(depositAmount)
    let currentTokenBal = await utils.getBalance(
      connection,
      catwifview.getTokenCwvAccount()
    )

    assert.equal(
      expectedTokenBal.toString(),
      currentTokenBal.toString(),
      'fail to deposit'
    )
  })

  it('depositAToken', async () => {
    let preTokenBal = await utils.getBalance(
      connection,
      catwifview.getTokenAAccount()
    )

    let depositAmount = utils.toTokenAmount(10, TOKEN_A_DECIMAL)
    try {
      let { txId } = await catwifview.depositAToken(
        depositAmount, // amount

        payerPubkey, // depositor
        payerPubkey, // admin
        payerATokenAccount // depositorATokenAccount
      )
      console.log('>>> depositAToken txId = ', txId)
    } catch (e) {
      console.log('>>> depositAToken error # \n ', e)
      assert(false, 'depositAToken error')
    }

    let expectedTokenBal = new anchor.BN(preTokenBal).add(depositAmount)
    let currentTokenBal = await utils.getBalance(
      connection,
      catwifview.getTokenAAccount()
    )

    assert.equal(
      expectedTokenBal.toString(),
      currentTokenBal.toString(),
      'fail to deposit'
    )
  })

  it('startGame', async () => {
    try {
      let amount = utils.toTokenAmount(1, TOKEN_A_DECIMAL)

      let { txId } = await catwifview.startGame(
        amount, // amount: BN,

        userKeypair, // user
        payerPubkey, // admin,
        userATokenAccount // userATokenAccount
      )
      console.log('>>> startGame txId = ', txId)
    } catch (e) {
      console.log('>>> startGame error # \n ', e)
      assert(false, 'startGame error')
    }
  })

  it('swapAWithMulti', async () => {
    try {
      let multi = new anchor.BN(3)
      let { txId } = await catwifview.swapAWithMulti(
        multi, // multi

        userPubkey, // user
        payerPubkey, // admin
        userCwvTokenAccount // userCwvTokenAccount
      )
      console.log('>>> swapAWithMulti txId = ', txId)
    } catch (e) {
      console.log('>>> swapAWithMulti error # \n ', e)
      assert(false, 'swapAWithMulti error')
    }
  })
})
