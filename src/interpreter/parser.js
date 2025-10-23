// Parser jest lekki: lista filtrów (predykatów-atomów), tekst łączony operatorami AND
// AST: { kind: 'kv'|'text', key?, value }

export function parse(tokens) {
  const ast = [];
  for (const t of tokens) {
    if (t.type === "KV") {
      ast.push({ kind: "kv", key: t.key, value: t.value });
    } else {
      ast.push({ kind: "text", value: t.value });
    }
  }
  return ast;
}
