// Prosty lexer: zamienia ciąg na tokeny (KEY:VALUE, albo TEXT/QUOTED)
export function lex(input) {
  if (!input || !input.trim()) return [];

  const tokens = [];
  const re = /"([^"]+)"|(\S+)/g; // wyłap "frazy w cudzysłowie" lub słowa
  let m;
  while ((m = re.exec(input)) !== null) {
    const quoted = m[1];
    const raw = m[2];
    const word = quoted ?? raw;

    // KEY:VALUE ?
    const kv = !quoted && raw && raw.includes(":") ? raw.split(":", 2) : null;
    if (kv && kv.length === 2) {
      const key = kv[0].toLowerCase();
      const value = kv[1];
      tokens.push({ type: "KV", key, value });
    } else {
      tokens.push({ type: quoted ? "QUOTED" : "TEXT", value: word });
    }
  }
  return tokens;
}
