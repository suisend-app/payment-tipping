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
  const [status, setStatus] = useState('')

  async function sendTip() {
    if (!currentAccount) {
      setStatus('Please connect your wallet.')
      return
    }
    if (!recipient || !amount) {
      setStatus('Recipient and amount required.')
      return
    }

    try {
      setStatus('Building transaction...')
      const tx = new TransactionBlock()

      if (coin === 'SUI') {
        // create a Move call to tipping::tip with SUI coin
        tx.moveCall({
          target: `${packageId}::tipping::tip`,
          typeArguments: ['0x2::sui::SUI'],
          arguments: [
            tx.pure(recipient),
            // SUI value passed by paying SUI as input; here we use tx.splitCoins pattern
          ],
        })
        // Note: For a production app you'd collect a SUI coin object from wallet; this is a simplified placeholder.
      } else {
        // USDC path (requires user coin object selection in production)
        tx.moveCall({
          target: `${packageId}::tipping::tip`,
          typeArguments: [usdcType],
          arguments: [
            tx.pure(recipient),
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
    <div className="bg-gray-800 p-4 rounded-lg mb-6">
      <h2 className="text-xl font-semibold mb-3">Send a Tip</h2>
      <div className="space-y-2">
        <input className="w-full p-2 rounded text-black" placeholder="Recipient address" value={recipient} onChange={(e)=>setRecipient(e.target.value)} />
        <input className="w-full p-2 rounded text-black" placeholder="Amount (e.g., 0.1)" value={amount} onChange={(e)=>setAmount(e.target.value)} />
        <textarea className="w-full p-2 rounded text-black" placeholder="Message (optional)" value={message} onChange={(e)=>setMessage(e.target.value)} />
        <select className="w-full p-2 rounded text-black" value={coin} onChange={(e)=>setCoin(e.target.value as 'SUI'|'USDC')}>
          <option value="SUI">SUI</option>
          <option value="USDC">USDC</option>
        </select>
        <button className="w-full py-2 bg-blue-600 rounded" onClick={sendTip}>Send Tip</button>
        <p className="text-sm text-gray-300 mt-2">{status}</p>
      </div>
    </div>
  )
}
