# Banking System Demo (Next.js + MongoDB)

This is a small full-stack Next.js app that simulates a simple banking system:

- Accounts with IBAN-like identifiers
- Centralized ledger stored in MongoDB
- Transfers between accounts
- Transaction history per account

## Features

- Create an account (holder name -> IBAN-like ID)
- View all accounts and balances
- Transfer funds from one account to another
- View transaction history for a selected account

## Tech Stack

- Next.js 14 (App Router)
- React
- MongoDB (via `mongodb` driver)

## Setup

1. Copy `.env.example` to `.env.local` and fill in:

```bash
MONGODB_URI="your-mongodb-connection-string"
MONGODB_DB="banking_demo"
BANK_COUNTRY_CODE="PK"
BANK_CODE="DL01"
```

2. Install dependencies:

```bash
npm install
```

3. Run the dev server:

```bash
npm run dev
```

4. Open http://localhost:3000 in your browser.

## Notes

- This is **not** production-grade banking software.
- There is no authentication and no concurrency handling with MongoDB transactions.
- It's for educational purposes to see how a centralized ledger compares to on-chain transfers.
