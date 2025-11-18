const country = process.env.BANK_COUNTRY_CODE || "PK";
const bankCode = process.env.BANK_CODE || "DL01";

function randomDigits(len: number): string {
  let s = "";
  for (let i = 0; i < len; i++) {
    s += Math.floor(Math.random() * 10).toString();
  }
  return s;
}

// Very simplified "IBAN-like" generator for demo purposes only
export function generateIban(): string {
  const accountPart = randomDigits(12);
  const checksum = randomDigits(2);
  return `${country}${checksum}${bankCode}${accountPart}`;
}
