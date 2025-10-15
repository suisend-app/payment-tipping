import React from 'react'
import TipForm from './components/TipForm'
import TipFeed from './components/TipFeed'

export default function App() {
  // Replace these with YOUR deployed package and registry IDs after publishing
  const PACKAGE_ID = '0xYOUR_PACKAGE_ID'
  const REGISTRY_ID = '0xYOUR_REGISTRY_ID' // not used in no-fee simple version
  const USDC_TYPE = "0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN";


  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-6">SuiTips — Tip with SUI or USDC</h1>
      <TipForm packageId={PACKAGE_ID} usdcType={USDC_TYPE} />
      <TipFeed packageId={PACKAGE_ID} />
    </div>
  )
}
