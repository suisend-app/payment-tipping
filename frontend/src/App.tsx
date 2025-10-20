import React, { useState, useEffect } from 'react';
import { ConnectButton, useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { Send, Loader2, CheckCircle2, XCircle, ExternalLink, Copy, Check } from 'lucide-react';

// Configuration - Replace these after deploying the Move package
const PACKAGE_ID = '0xc6b941e27864245770d39a95305211836dbf86ce7be65c47d75ce23b32e88103';
const MODULE_NAME = 'tipping';

const TippingDApp = () => {
  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const suiClient = useSuiClient();

  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [txDigest, setTxDigest] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [balance, setBalance] = useState('0');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (currentAccount) {
      fetchBalance();
    }
  }, [currentAccount]);

  const fetchBalance = async () => {
    if (!currentAccount) return;
    try {
      const balanceData = await suiClient.getBalance({
        owner: currentAccount.address,
      });
      const suiBalance = (Number(balanceData.totalBalance) / 1_000_000_000).toFixed(4);
      setBalance(suiBalance);
    } catch (err) {
      console.error('Error fetching balance:', err);
    }
  };

  const calculateFee = (tipAmount: string) => {
    const amount = parseFloat(tipAmount);
    if (isNaN(amount)) return { fee: 0, total: 0 };
    const fee = amount * 0.015;
    return {
      fee: fee.toFixed(4),
      total: (amount + fee).toFixed(4)
    };
  };

  const handleCopyAddress = () => {
    if (currentAccount) {
      navigator.clipboard.writeText(currentAccount.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSendTip = async () => {
    if (!currentAccount) {
      setError('Please connect your wallet first');
      return;
    }

    if (!recipient || !amount) {
      setError('Please fill in all required fields');
      return;
    }

    if (parseFloat(amount) <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);
    setTxDigest('');

    try {
      const tx = new Transaction();
      
      const tipAmountMist = Math.floor(parseFloat(amount) * 1_000_000_000);
      const feeAmountMist = Math.floor(tipAmountMist * 0.015);
      const totalAmountMist = tipAmountMist + feeAmountMist;

      const [tipCoin] = tx.splitCoins(tx.gas, [totalAmountMist]);

      tx.moveCall({
        target: `${PACKAGE_ID}::${MODULE_NAME}::send_tip`,
        arguments: [
          tx.pure.address(recipient),
          tipCoin,
          tx.pure.u64(tipAmountMist),
          tx.pure.string(message || ''),
        ],
      });

      signAndExecute(
        { transaction: tx },
        {
          onSuccess: async (result) => {
            setTxDigest(result.digest);
            setSuccess(true);
            setRecipient('');
            setAmount('');
            setMessage('');
            await fetchBalance();
            setLoading(false);
          },
          onError: (err) => {
            setError(err.message || 'Transaction failed');
            setLoading(false);
          },
        }
      );
    } catch (err: any) {
      setError(err.message || 'Failed to send tip');
      setLoading(false);
    }
  };

  const { fee, total } = calculateFee(amount);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Send className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">SuiTips</h1>
                <p className="text-sm text-gray-500">Decentralized Tipping on Sui</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {currentAccount && (
                <div className="text-right mr-4">
                  <p className="text-sm text-gray-500">Balance</p>
                  <p className="text-lg font-semibold text-gray-900">{balance} SUI</p>
                </div>
              )}
              <ConnectButton />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!currentAccount ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Send className="w-10 h-10 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome to SuiTips
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Send instant tips on the Sui blockchain with just 1.5% fee. 
              No intermediaries, no waiting. Connect your wallet to get started.
            </p>
            <div className="inline-block">
              <ConnectButton />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
              <p className="text-sm font-medium opacity-90 mb-2">Your Tip Address</p>
              <div className="flex items-center justify-between">
                <code className="text-lg font-mono break-all">
                  {currentAccount.address}
                </code>
                <button
                  onClick={handleCopyAddress}
                  className="ml-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Send a Tip</h2>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recipient Address *
                  </label>
                  <input
                    type="text"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="0x..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount (SUI) *
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    step="0.001"
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="mt-2 flex gap-2">
                    {[0.1, 0.5, 1, 5].map((preset) => (
                      <button
                        key={preset}
                        onClick={() => setAmount(preset.toString())}
                        className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
                      >
                        {preset} SUI
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message (Optional)
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Add a message with your tip..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                {amount && parseFloat(amount) > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tip Amount:</span>
                      <span className="font-medium text-gray-900">{amount} SUI</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Platform Fee (1.5%):</span>
                      <span className="font-medium text-gray-900">{fee} SUI</span>
                    </div>
                    <div className="border-t border-gray-200 pt-2 flex justify-between">
                      <span className="font-medium text-gray-900">Total (incl. gas):</span>
                      <span className="font-bold text-gray-900">{total} SUI</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      * Gas fees will be added by the network
                    </p>
                  </div>
                )}

                {error && (
                  <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                {success && txDigest && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      <p className="text-sm font-medium text-green-700">Tip sent successfully!</p>
                    </div>
                    
                      href={`https://suiscan.xyz/mainnet/tx/${txDigest}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-green-600 hover:text-green-700"
                    >
                      View on Explorer <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                )}

                <button
                  onClick={handleSendTip}
                  disabled={loading || !recipient || !amount}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-4 rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Send Tip
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-6 shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Send className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Instant Tips</h3>
                <p className="text-sm text-gray-600">
                  Send tips instantly on the Sui blockchain with sub-second finality
                </p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Low Fees</h3>
                <p className="text-sm text-gray-600">
                  Only 1.5% platform fee, charged to the receiver
                </p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <ExternalLink className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Transparent</h3>
                <p className="text-sm text-gray-600">
                  All transactions verified on-chain, fully transparent
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-12 border-t border-gray-200">
        <p className="text-center text-gray-500 text-sm">
          Built on Sui • Decentralized • Secure • Open Source
        </p>
      </footer>
    </div>
  );
};
