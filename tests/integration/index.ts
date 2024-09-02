import { Program, BN, AnchorProvider, Wallet, Idl } from '@coral-xyz/anchor'
import {
  PublicKey,
  Keypair,
  Connection,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  SYSVAR_INSTRUCTIONS_PUBKEY,
  Transaction
} from '@solana/web3.js'
import {
  TOKEN_PROGRAM_ID
} from '@solana/spl-token'

import { Catwifview } from '../../target/types/catwifview'
import * as idl from '../../target/idl/catwifview.json'
import { DefaultProgramAccounts, Result } from './types'
import {
  TOKEN_A_ACCOUNT,
  TOKEN_CWV_ACCOUNT,
  TREASURY,
  TREASURY_AUTHORITY,
  USER_INFO
} from './constants'

const defaultProgramAccounts: DefaultProgramAccounts = {
  systemProgram: SystemProgram.programId,
  tokenProgram: TOKEN_PROGRAM_ID,
  rent: SYSVAR_RENT_PUBKEY,
  instruction: SYSVAR_INSTRUCTIONS_PUBKEY
}

export default class CatwifviewImpl {
  private connection: Connection
  private program: Program<Catwifview>

  constructor (program: Program<Catwifview>, connection: Connection) {
    this.program = program
    this.connection = connection
  }

  public static create (endpoint: string) {
    const connection = new Connection(endpoint)

    const provider = new AnchorProvider(
      connection,
      new Wallet(Keypair.generate()),
      { commitment: 'processed' }
    )
    const program = new Program(
      idl as Idl,
      new PublicKey(provider.publicKey)
    ) as unknown as Program<Catwifview>

    let Catwifview: CatwifviewImpl = new CatwifviewImpl(program, connection)
    return Catwifview
  }
  public setWallet (wallet: Wallet) {
    const provider = new AnchorProvider(this.connection, wallet, {
      commitment: 'processed'
    })
    this.program = new Program<Catwifview>(
      this.program.idl,
      this.program.programId,
      provider
    )
  }
  public setWalletKeypair (keypair: Keypair) {
    const wallet = new Wallet(keypair)
    this.setWallet(wallet)
  }

  public getPda (
    seeds: Buffer[],
    programId: PublicKey = this.program.programId
  ): PublicKey {
    return PublicKey.findProgramAddressSync(seeds, programId)[0]
  }

  public pdaCheck (
    PDAs: { pdaIdentifier: string; pdaSeeds: Buffer[]; account: PublicKey }[]
  ): string {
    for (var pda of PDAs) {
      if (this.getPda(pda.pdaSeeds) !== pda.account)
        return 'Invalid ' + pda.pdaIdentifier + ' account.'
    }
    return ''
  }

  public getTreasury (): PublicKey {
    return this.getPda([Buffer.from(TREASURY)])
  }

  public getTreasuryAuthority (): PublicKey {
    return this.getPda([Buffer.from(TREASURY_AUTHORITY)])
  }

  public getTokenCwvAccount (): PublicKey {
    return this.getPda([Buffer.from(TOKEN_CWV_ACCOUNT)])
  }

  public getTokenAAccount (): PublicKey {
    return this.getPda([Buffer.from(TOKEN_A_ACCOUNT)])
  }

  public getUserInfo (userPubkey: PublicKey): PublicKey {
    return this.getPda([Buffer.from(USER_INFO), userPubkey.toBuffer()])
  }

  public async getTokenAccountByOwner (owner: PublicKey, mint: PublicKey) {
    let tokenAccounts = (
      await this.connection.getParsedTokenAccountsByOwner(owner, { mint })
    ).value
    if (tokenAccounts.length > 0) {
      let maxAmount = 0
      let tokenAccount = tokenAccounts[0].pubkey
      tokenAccounts.forEach(val => {
        let amount = val.account.data.parsed.uiAmount
        if (amount > maxAmount) {
          tokenAccount = val.pubkey
          maxAmount = amount
        }
      })
      return { tokenAccount, uiAmount: maxAmount }
    }
    return { tokenAccount: null, uiAmount: 0 }
  }

  public async initializeTreasury (
    payer: PublicKey, //payer
    tokenCwvMint: PublicKey, //CWV token mint
    tokenAMint: PublicKey // Token A mint
  ): Promise<Transaction> {
    let treasury = this.getTreasury()
    let treasuryAuthority = this.getTreasuryAuthority()
    let treasuryCwvTokenAccount = this.getTokenCwvAccount()
    let treasuryATokenAccount = this.getTokenAAccount()

    let initializeTreasuryAccounts = {
      payer,
      treasury,
      treasuryAuthority,
      ...defaultProgramAccounts
    }

    let initializeTreasuryTx = await this.program.methods
      .initializeTreasury()
      .accounts(initializeTreasuryAccounts)
      .rpc()

    let latestBlockhash = await this.connection.getLatestBlockhash('finalized')
    await this.connection.confirmTransaction({
      signature: initializeTreasuryTx,
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
    })

    console.log('>>> initializeTreasuryTx : ', initializeTreasuryTx)

    let initializeCwvVaultAccounts = {
      payer,
      treasury,
      treasuryAuthority,
      tokenCwvMint,
      treasuryCwvTokenAccount,
      ...defaultProgramAccounts
    }

    let ix1 = await this.program.methods
      .initializeCwvVault()
      .accounts(initializeCwvVaultAccounts)
      .instruction()

    let initializeAVaultAccounts = {
      payer,
      treasury,
      treasuryAuthority,
      tokenAMint,
      treasuryATokenAccount,
      ...defaultProgramAccounts
    }

    let ix2 = await this.program.methods
      .initializeAVault()
      .accounts(initializeAVaultAccounts)
      .instruction()

    let tx = new Transaction().add(ix1, ix2)

    return tx
  }

  public async depositCwvToken (
    amount: BN,

    depositor: PublicKey,
    admin: PublicKey,
    depositorCwvTokenAccount: PublicKey
  ): Promise<Result> {
    let treasury = this.getTreasury()
    let treasuryAuthority = this.getTreasuryAuthority()
    let treasuryCwvTokenAccount = this.getTokenCwvAccount()

    let accounts = {
      depositor,
      admin,
      treasury,
      treasuryAuthority,
      depositorCwvTokenAccount,
      treasuryCwvTokenAccount,
      ...defaultProgramAccounts
    }

    let params = {
      amount: amount
    }

    let depositCwvTokenTx = await this.program.methods
      .depositCwvToken(params)
      .accounts(accounts)
      .rpc()

    let latestBlockhash = await this.connection.getLatestBlockhash('finalized')
    await this.connection.confirmTransaction({
      signature: depositCwvTokenTx,
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
    })

    return {
      success: true,
      msg: null,
      txId: depositCwvTokenTx
    }
  }

  public async depositAToken (
    amount: BN,

    depositor: PublicKey,
    admin: PublicKey,
    depositorATokenAccount: PublicKey
  ): Promise<Result> {
    let treasury = this.getTreasury()
    let treasuryAuthority = this.getTreasuryAuthority()
    let treasuryATokenAccount = this.getTokenAAccount()

    let accounts = {
      depositor,
      admin,
      treasury,
      treasuryAuthority,
      depositorATokenAccount,
      treasuryATokenAccount,
      ...defaultProgramAccounts
    }

    let params = {
      amount: amount
    }

    let depositATokenTx = await this.program.methods
      .depositAToken(params)
      .accounts(accounts)
      .rpc()

    let latestBlockhash = await this.connection.getLatestBlockhash('finalized')
    await this.connection.confirmTransaction({
      signature: depositATokenTx,
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
    })

    return {
      success: true,
      msg: null,
      txId: depositATokenTx
    }
  }

  public async startGame (
    amount: BN,

    user: Keypair,
    admin: PublicKey,
    userATokenAccount: PublicKey
  ): Promise<Result> {
    let treasury = this.getTreasury()
    let treasuryAuthority = this.getTreasuryAuthority()
    let treasuryATokenAccount = this.getTokenAAccount()
    let userInfo = this.getUserInfo(user.publicKey)

    let accounts = {
      user: user.publicKey,
      admin,
      treasury,
      treasuryAuthority,
      userATokenAccount,
      treasuryATokenAccount,
      userInfo,
      ...defaultProgramAccounts
    }

    let params = {
      amount: amount
    }

    let startGameTx = await this.program.methods
      .startGame(params)
      .accounts(accounts)
      .signers([user])
      .rpc()

    return {
      success: true,
      msg: null,
      txId: startGameTx
    }
  }

  public async swapAWithMulti (
    multi: BN,

    user: PublicKey,
    admin: PublicKey,
    userCwvTokenAccount: PublicKey
  ): Promise<Result> {
    let treasury = this.getTreasury()
    let treasuryAuthority = this.getTreasuryAuthority()
    let treasuryCwvTokenAccount = this.getTokenCwvAccount()
    let userInfo = this.getUserInfo(user)

    let accounts = {
      user,
      admin,
      treasury,
      treasuryAuthority,
      userInfo,
      userCwvTokenAccount,
      treasuryCwvTokenAccount,
      ...defaultProgramAccounts
    }

    let params = {
      multi: multi.toNumber()
    }

    let swapAWithMultiTx = await this.program.methods
      .swapAWithMulti(params)
      .accounts(accounts)
      .rpc()

    return {
      success: true,
      msg: null,
      txId: swapAWithMultiTx
    }
  }
}
