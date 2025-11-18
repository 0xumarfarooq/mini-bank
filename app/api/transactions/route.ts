import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const iban = req.nextUrl.searchParams.get("iban");
    if (!iban) {
      return NextResponse.json({ error: "iban is required" }, { status: 400 });
    }

    const db = await getDb();
    const txs = db.collection("transactions");

    const docs = await txs
      .find({ $or: [{ fromIban: iban }, { toIban: iban }] })
      .sort({ createdAt: -1 })
      .toArray();

    const formatted = docs.map((d: any) => ({
      _id: d._id.toString(),
      fromIban: d.fromIban,
      toIban: d.toIban,
      amount: d.amount,
      createdAt: d.createdAt,
      status: d.status,
    }));

    return NextResponse.json({ transactions: formatted });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message || "Internal error" }, { status: 500 });
  }
}
