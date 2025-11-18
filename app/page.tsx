"use client";

import { useEffect, useState } from "react";

type Account = {
  iban: string;
  holderName: string;
  balance: number;
  createdAt: string;
};

type Transaction = {
  _id: string;
  fromIban: string;
  toIban: string;
  amount: number;
  createdAt: string;
  status: string;
};

export default function Home() {
  const [holderName, setHolderName] = useState("");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const [fromIban, setFromIban] = useState("");
  const [toIban, setToIban] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [selectedIban, setSelectedIban] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  async function refreshAccounts() {
    const res = await fetch("/api/accounts");
    const data = await res.json();
    if (res.ok) setAccounts(data.accounts || []);
  }

  async function createAccount() {
    setMessage(null);
    const res = await fetch("/api/accounts/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ holderName }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error || "Failed to create account");
    } else {
      setMessage(data.message);
      setHolderName("");
      refreshAccounts();
    }
  }

  async function makeTransfer() {
    setMessage(null);
    const res = await fetch("/api/transfer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fromIban, toIban, amount }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error || "Transfer failed");
    } else {
      setMessage(data.message);
      setAmount(0);
      refreshAccounts();
      if (selectedIban) loadTransactions(selectedIban);
    }
  }

  async function loadTransactions(iban: string) {
    setSelectedIban(iban);
    const res = await fetch(`/api/transactions?iban=${encodeURIComponent(iban)}`);
    const data = await res.json();
    if (res.ok) setTransactions(data.transactions || []);
  }

  useEffect(() => {
    refreshAccounts();
  }, []);

  return (
    <main className="min-h-screen py-10 px-4 flex flex-col gap-8">
      <header className="mb-2">
        <h1 className="text-2xl font-bold text-sky-300">Banking System Demo</h1>
        <p className="text-slate-300 text-sm max-w-2xl mt-1">
          This simulates a mini banking system: accounts have IBAN-like identifiers,
          balances are stored in a central ledger (MongoDB), and transfers update
          both accounts and a transaction log. Think of it as a centralized analogue
          to on-chain wallet transfers.
        </p>
      </header>

      <section className="grid md:grid-cols-2 gap-6">
        <div className="border border-slate-700 bg-slate-900/60 rounded-lg p-4 space-y-3 shadow-lg">
          <h2 className="font-semibold text-lg mb-1 text-slate-100">Create Account</h2>
          <label className="text-sm text-slate-300">
            Account Holder Name
            <input
              className="mt-1 border border-slate-600 bg-slate-800 px-2 py-1 w-full rounded text-sm text-slate-100"
              placeholder="Alice"
              value={holderName}
              onChange={(e) => setHolderName(e.target.value)}
            />
          </label>
          <button
            className="bg-sky-600 hover:bg-sky-500 text-white px-4 py-2 rounded text-sm font-medium w-full"
            onClick={createAccount}
          >
            Open New Account
          </button>
          <p className="text-xs text-slate-400">
            When you create an account, the system generates an IBAN-like ID and
            initializes a balance of 0. All data is stored off-chain in MongoDB.
          </p>
        </div>

        <div className="border border-slate-700 bg-slate-900/60 rounded-lg p-4 space-y-3 shadow-lg">
          <h2 className="font-semibold text-lg mb-1 text-slate-100">Make Transfer</h2>
          <label className="text-sm text-slate-300">
            From IBAN
            <select
              className="mt-1 border border-slate-600 bg-slate-800 px-2 py-1 w-full rounded text-sm text-slate-100"
              value={fromIban}
              onChange={(e) => setFromIban(e.target.value)}
            >
              <option value="">Select source account</option>
              {accounts.map((acc) => (
                <option key={acc.iban} value={acc.iban}>
                  {acc.holderName} — {acc.iban} (₵{acc.balance.toFixed(2)})
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm text-slate-300">
            To IBAN
            <select
              className="mt-1 border border-slate-600 bg-slate-800 px-2 py-1 w-full rounded text-sm text-slate-100"
              value={toIban}
              onChange={(e) => setToIban(e.target.value)}
            >
              <option value="">Select destination account</option>
              {accounts.map((acc) => (
                <option key={acc.iban} value={acc.iban}>
                  {acc.holderName} — {acc.iban}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm text-slate-300">
            Amount
            <input
              type="number"
              className="mt-1 border border-slate-600 bg-slate-800 px-2 py-1 w-full rounded text-sm text-slate-100"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              min={0}
            />
          </label>

          <button
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded text-sm font-medium w-full"
            onClick={makeTransfer}
          >
            Transfer
          </button>

          <p className="text-xs text-slate-400">
            Transfers simply move balances between accounts in the central ledger,
            similar to how bank-to-bank transfers update internal databases.
          </p>
        </div>
      </section>

      <section className="border border-slate-700 bg-slate-900/60 rounded-lg p-4 space-y-4 shadow-lg">
        <h2 className="font-semibold text-lg mb-1 text-slate-100">Accounts & Transactions</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-200 mb-1">All Accounts</h3>
            <div className="border border-slate-700 rounded-lg max-h-64 overflow-auto text-sm">
              {accounts.length === 0 && (
                <p className="p-3 text-slate-400 text-xs">No accounts yet.</p>
              )}
              {accounts.map((acc) => (
                <div
                  key={acc.iban}
                  className="px-3 py-2 border-b border-slate-800 hover:bg-slate-800/60 cursor-pointer"
                  onClick={() => loadTransactions(acc.iban)}
                >
                  <div className="flex justify-between items-center gap-2">
                    <span className="font-medium text-slate-100">{acc.holderName}</span>
                    <span className="text-emerald-300 text-xs font-mono">
                      ₵{acc.balance.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 break-all">
                    {acc.iban}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-200 mb-1">
              Transactions {selectedIban && <span className="text-xs text-slate-400">for {selectedIban}</span>}
            </h3>
            <div className="border border-slate-700 rounded-lg max-h-64 overflow-auto text-sm">
              {(!transactions || transactions.length === 0) && (
                <p className="p-3 text-slate-400 text-xs">
                  Select an account to view transaction history.
                </p>
              )}
              {transactions.map((tx) => (
                <div key={tx._id} className="px-3 py-2 border-b border-slate-800">
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-xs text-slate-300">
                      {tx.fromIban === selectedIban ? "Sent" : "Received"}
                    </span>
                    <span
                      className={`text-xs font-mono ${
                        tx.fromIban === selectedIban ? "text-rose-300" : "text-emerald-300"
                      }`}
                    >
                      {tx.fromIban === selectedIban ? "-" : "+"}₵{tx.amount.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 break-all">
                    From: {tx.fromIban}
                    <br />
                    To: {tx.toIban}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    {new Date(tx.createdAt).toLocaleString()} · {tx.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {message && (
        <p className="mt-2 text-sm text-center text-sky-300 max-w-lg mx-auto whitespace-pre-wrap">
          {message}
        </p>
      )}
    </main>
  );
}
