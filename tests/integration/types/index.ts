import { Program } from '@coral-xyz/anchor'
import {
  PublicKey,
  TransactionSignature} from '@solana/web3.js'
import { Catwifview } from '../../../target/types/catwifview'

export type CatwifviewProgram = Program<Catwifview>

export type DefaultProgramAccounts = {
  tokenProgram: PublicKey
  systemProgram: PublicKey
  rent: PublicKey
  instruction: PublicKey
}

export interface Result {
    success: boolean
    msg: null | string
    txId: null | TransactionSignature,
  }
