import React, { useState } from 'react'
import { useWallet } from '@mysten/wallet-kit'
import { TransactionBlock } from '@mysten/sui.js'

type Props = {
  packageId: string
  usdcType: string
}

export default function TipForm({ packageId, usdcType }: Props) {
  const { signAndExecuteTransactionBlock, currentAccount } = useWallet()
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [message, setMessage] = useState('')
  const [coin, setCoin] = useState<'SUI' | 'USDC'>('SUI')
  const [creator, setCreator] = useState('') // creator address (fee receiver)
  const [status, setStatus] = useState('')

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentAccount) {
      setStatus('Please connect your wallet.')
      return
    }
    if (!recipient || !amount || !creator) {
      setStatus('Recipient, amount, and creator address required.')
      return
    }

    try {
      setStatus('Building transaction...')
      const tx = new TransactionBlock()

      // Note: In production you should collect exact coin objects from the user's wallet
      // and pass them as inputs to the TX. For simplicity we construct a pay-sui/pay call pattern.
      if (coin === 'SUI') {
        // Pay with SUI: create a coin with the requested amount and pass it as the first argument
        // This example uses `tx.splitCoins` pattern from sui.js to create a coin input.
        const suiAmount = Number(amount)
        const coinArg = tx.splitCoins(tx.gas, [tx.pure(suiAmount)])
        tx.moveCall({
          target: `${packageId}::tipping::tip`,
          typeArguments: ['0x2::sui::SUI'],
          arguments: [
            coinArg,
            tx.pure(recipient),
            tx.pure(creator)
          ],
        })
      } else {
        // USDC path: the frontend must collect a specific USDC coin object id from the wallet.
        // For a simple demo, we assume the wallet can provide a Coin input object via `tx.input`.
        // Replace this with a proper coin picker in production.
        const typeArg = usdcType
        // placeholder: pass an input coin object (wallet integration needed here)
        const coinArg = tx.pure(Number(amount))
        tx.moveCall({
          target: `${packageId}::tipping::tip`,
          typeArguments: [typeArg],
          arguments: [
            coinArg,
            tx.pure(recipient),
            tx.pure(creator)
          ],
        })
      }

      setStatus('Requesting signature...')
      const res = await signAndExecuteTransactionBlock({
        transactionBlock: tx,
        options: { showEffects: true }
      })
      setStatus('✅ Tip sent: ' + res.digest)
    } catch (e) {
      console.error(e)
      setStatus('❌ Transaction failed.')
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <label>
        Recipient:
        <input value={recipient} onChange={e => setRecipient(e.target.value)} />
      </label>
      <label>
        Amount:
        <input value={amount} onChange={e => setAmount(e.target.value)} />
      </label>
      <label>
        Coin:
        <select value={coin} onChange={e => setCoin(e.target.value as any)}>
          <option value="SUI">SUI</option>
          <option value="USDC">USDC</option>
        </select>
      </label>
      <label>
        Creator (fee receiver) address:
        <input value={creator} onChange={e => setCreator(e.target.value)} placeholder="0x..." />
      </label>
      <button type="submit">Send Tip</button>
      <div>{status}</div>
    </form>
  )
}
