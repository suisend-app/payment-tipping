import React, { useState } from "react";
import { useWallet } from "@mysten/wallet-kit";
import { JsonRpcProvider, TransactionBlock } from "@mysten/sui.js";

const SUI_NETWORK = "https://fullnode.testnet.sui.io:443";
const PACKAGE_ID = "0xc6b941e27864245770d39a95305211836dbf86ce7be65c47d75ce23b32e88103";

function AppInner() {
  const { connect, disconnect, account, signAndExecuteTransactionBlock, connected } = useWallet();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [token, setToken] = useState("SUI");
  const [status, setStatus] = useState("");

  async function sendTip() {
    setStatus("Preparing transaction...");
    if (!connected) return setStatus("Wallet not connected");
    if (!recipient) return setStatus("Enter recipient address");
    if (!amount || isNaN(Number(amount))) return setStatus("Enter valid amount");

    try {
      const provider = new JsonRpcProvider({ url: SUI_NETWORK });
      const tx = new TransactionBlock();

      if (token === "SUI") {
        // Use sui.js helper to transfer SUI coin (this is a placeholder pattern).
        tx.transferObjects([tx.pure(recipient)], tx.pure(recipient)); // placeholder
      } else {
        // Placeholder for USDC transfer via Move call (requires correct module & args)
        tx.moveCall({
          target: `${PACKAGE_ID}::module::transfer`,
          arguments: [tx.pure(recipient), tx.pure(Number(amount))],
        });
      }

      setStatus("Requesting wallet signature...");
      const result = await signAndExecuteTransactionBlock({
        transactionBlock: tx,
        options: { showEffects: true }
      });
      setStatus("Transaction sent. Digest: " + result.digest);
    } catch (e) {
      console.error(e);
      setStatus("Error: " + (e.message || e.toString()));
    }
  }

  return (
    <div className="container">
      <header>
        <h1>SuiSend — Tip in SUI / USDC</h1>
        <div className="wallet-area">
          {connected ? (
            <>
              <div className="acct">Account: {account?.address}</div>
              <button onClick={disconnect}>Disconnect</button>
            </>
          ) : (
            <button onClick={() => connect()}>Connect Wallet</button>
          )}
        </div>
      </header>

      <main>
        <div className="card">
          <label>Recipient address</label>
          <input value={recipient} onChange={e => setRecipient(e.target.value)} placeholder="0x..." />

          <label>Amount</label>
          <input value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.1" />

          <label>Token</label>
          <select value={token} onChange={e => setToken(e.target.value)}>
            <option value="SUI">SUI</option>
            <option value="USDC">USDC</option>
          </select>

          <div className="actions">
            <button className="primary" onClick={sendTip}>Send Tip</button>
          </div>

          <div className="status">Status: {status}</div>
        </div>

        <section className="info">
          <h2>Deployment info</h2>
          <p>Package ID used: <code>{PACKAGE_ID}</code></p>
          <p>Network RPC: <code>{SUI_NETWORK}</code></p>
        </section>
      </main>

      <footer>
        <small>Built for debugging & deployment. Plain CSS, Vite + React.</small>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AppInner />
  );
}
