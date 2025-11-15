// src/kanban/SearchBar.jsx

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { uiBus } from "../mediator/UIBus";

export default function SearchBar({ initial = "" }) {
  const [query, setQuery] = useState(initial);

  // Reaguj na SET_QUERY z innych paneli (Mediator)
  useEffect(() => {
    const unsubscribe = uiBus.on("SET_QUERY", ({ query }) => {
      setQuery(query ?? "");
    });
    return unsubscribe;
  }, []);

  function emitSearchQuery(nextQuery) {
    uiBus.emit("SET_QUERY", { query: nextQuery });
  }

  function handleSubmit(event) {
    event.preventDefault();
    emitSearchQuery(query);
  }

  function handleClear() {
    setQuery("");
    emitSearchQuery("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow p-3 flex items-center gap-2"
    >
      <Search />
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder='Szukaj… np. tag:work status:done "raport" before:2025-12-31'
        className="w-full outline-none"
      />
      <button
        type="submit"
        className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-sm"
      >
        Szukaj
      </button>
      <button
        type="button"
        onClick={handleClear}
        className="px-2 py-1.5 text-sm rounded-xl bg-slate-100"
      >
        Wyczyść
      </button>
    </form>
  );
}
