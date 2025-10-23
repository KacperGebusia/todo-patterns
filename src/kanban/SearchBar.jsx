import { useState } from "react";
import { Search } from "lucide-react";

// prosty controlled component; onQuery(q) woła rodzica
export default function SearchBar({ initial = "", onQuery }) {
  const [q, setQ] = useState(initial);
  return (
    <form
      onSubmit={(e)=>{ e.preventDefault(); onQuery?.(q); }}
      className="bg-white rounded-2xl shadow p-3 flex items-center gap-2"
    >
      <Search />
      <input
        value={q}
        onChange={(e)=> setQ(e.target.value)}
        placeholder='Szukaj… np. tag:work status:done "naprawić login" before:2025-12-31'
        className="w-full outline-none"
      />
      <button type="submit" className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-sm">
        Szukaj
      </button>
      <button type="button" onClick={()=> { setQ(""); onQuery?.(""); }} className="px-2 py-1.5 text-sm rounded-xl bg-slate-100">
        Wyczyść
      </button>
    </form>
  );
}
