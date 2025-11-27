// src/kanban/SearchBar.jsx

// Zad 7 jeden poziom abstrakcji (top to bottom)
// handlesubmit - tylko UI - logika w emitquery

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { uiBus } from "../mediator/UIBus";

// =====================
// GŁÓWNY KOMPONENT
// =====================

export default function SearchBar({ initial = "" }) {
  const [query, setQuery] = useState(initial);

  useSyncQueryFromMediator(setQuery);

  const handleSubmit = (event) => {
    event.preventDefault();
    emitQuery(query);
  };

  const handleClear = () => {
    setQuery("");
    emitQuery("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow p-3 flex items-center gap-2"
    >
      <Search />
      <input
        value={query}
        onChange={(event) =>
          setQuery(event.target.value)
        }
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

// =====================
// HOOKI / UTILS
// =====================

function useSyncQueryFromMediator(setQuery) {
  useEffect(() => {
    const handleSetQuery = ({ query }) => {
      setQuery(query ?? "");
    };

    const unsubscribe = uiBus.on(
      "SET_QUERY",
      handleSetQuery
    );
    return unsubscribe;
  }, [setQuery]);
}

function emitQuery(query) {
  uiBus.emit("SET_QUERY", { query });
}
