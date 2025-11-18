import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { fromIban, toIban, amount } = await req.json();

    if (!fromIban || !toIban || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { error: "fromIban, toIban and positive amount are required" },
        { status: 400 }
      );
    }

    if (fromIban === toIban) {
      return NextResponse.json(
        { error: "Cannot transfer to the same account" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const accounts = db.collection("accounts");
    const txs = db.collection("transactions");

    const fromAcc = await accounts.findOne({ iban: fromIban });
    const toAcc = await accounts.findOne({ iban: toIban });

    if (!fromAcc || !toAcc) {
      return NextResponse.json({ error: "Invalid from/to IBAN" }, { status: 404 });
    }

    if (fromAcc.balance < amount) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
    }

    await accounts.updateOne({ iban: fromIban }, { $inc: { balance: -amount } });
    await accounts.updateOne({ iban: toIban }, { $inc: { balance: amount } });

    const txDoc = {
      fromIban,
      toIban,
      amount,
      createdAt: new Date(),
      status: "completed",
    };
    await txs.insertOne(txDoc);

    return NextResponse.json({ message: "Transfer completed" });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message || "Internal error" }, { status: 500 });
  }
}
