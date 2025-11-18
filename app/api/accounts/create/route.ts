import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { generateIban } from "@/lib/iban";

export async function POST(req: NextRequest) {
  try {
    const { holderName } = await req.json();

    if (!holderName || typeof holderName !== "string") {
      return NextResponse.json({ error: "holderName is required" }, { status: 400 });
    }

    const db = await getDb();
    const accounts = db.collection("accounts");

    const iban = generateIban();
    const doc = {
      iban,
      holderName,
      balance: 0,
      createdAt: new Date(),
    };

    await accounts.insertOne(doc);

    return NextResponse.json({
      message: `Account created for ${holderName}`,
      iban,
    });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message || "Internal error" }, { status: 500 });
  }
}
