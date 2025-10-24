// src/kanban/SearchBar.jsx
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { uiBus } from "../mediator/UIBus";

export default function SearchBar({ initial = "" }) {
  const [q, setQ] = useState(initial);

  // opcjonalnie reaguj na SET_QUERY z innych paneli
  useEffect(() => {
    const off = uiBus.on("SET_QUERY", ({ query }) => setQ(query ?? ""));
    return off;
  }, []);

  function submit(e){
    e.preventDefault();
    uiBus.emit("SET_QUERY", { query: q });
  }

  function clear(){
    setQ("");
    uiBus.emit("SET_QUERY", { query: "" });
  }

  return (
    <form onSubmit={submit} className="bg-white rounded-2xl shadow p-3 flex items-center gap-2">
      <Search />
      <input
        value={q}
        onChange={(e)=> setQ(e.target.value)}
        placeholder='Szukaj… np. tag:work status:done "raport" before:2025-12-31'
        className="w-full outline-none"
      />
      <button type="submit" className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-sm">
        Szukaj
      </button>
      <button type="button" onClick={clear} className="px-2 py-1.5 text-sm rounded-xl bg-slate-100">
        Wyczyść
      </button>
    </form>
  );
}
