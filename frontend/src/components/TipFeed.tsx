import React, { useEffect, useState } from 'react'
import { SuiClient } from '@mysten/sui';
const client = new SuiClient({ url: getFullnodeUrl('mainnet') })

type Props = { packageId: string }

export default function TipFeed({ packageId }: Props) {
  const [tips, setTips] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchTips() {
    try {
      const res = await client.queryEvents({
        query: { MoveEventType: `${packageId}::tipping::TipEvent` },
        limit: 50
      })
      const parsed = res.data.map((e:any)=>{
        const p = e.parsedJson
        const coin = p.coin_type ? p.coin_type : 'SUI'
        return {
          id: p.id,
          sender: p.sender,
          recipient: p.recipient,
          amount: Number(p.amount)/1e9,
          coin,
          message: p.message,
          timestamp: new Date(Number(p.timestamp))
        }
      }).reverse()
      setTips(parsed)
    } catch(e){
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(()=>{
    fetchTips()
    const iv = setInterval(fetchTips,15000)
    return ()=>clearInterval(iv)
  },[])

  if (loading) return <div className="text-center p-4">Loading tips...</div>

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <h2 className="text-xl font-semibold mb-3">Recent Tips</h2>
      {tips.length===0 && <p className="text-gray-400">No tips yet.</p>}
      <ul className="space-y-3">
        {tips.map(t=>(
          <li key={t.id} className="bg-gray-700 p-3 rounded">
            <div className="flex justify-between">
              <div><b>{t.amount}</b> {t.coin}</div>
              <div className="text-xs text-gray-300">{t.timestamp.toLocaleString()}</div>
            </div>
            {t.message && <div className="text-sm italic mt-1">{t.message}</div>}
            <div className="text-xs mt-2 text-gray-400">From: {t.sender}</div>
          </li>
        ))}
      </ul>
    </div>
  )
}
