// Warstwa UI layoutu
// [PATTERN: Bridge] — UŻYCIE: przełączanie backendu przez select
// [PATTERN: Observer] — UŻYCIE: backend/lastError/ready z kontekstu

import { useState } from "react";
import { Database } from "lucide-react";
import { useStore } from "../store/StoreContext";
import Board from "../kanban/Board";

export default function App(){
  const { backend, lastError, ready, todoStore } = useStore();
  const [view] = useState("board");

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex flex-wrap items-center gap-3 px-4 py-2 border-b bg-white">
        <div className="inline-flex items-center gap-2 text-sm text-slate-600">
          <Database size={16} />
          <span>Backend:</span>
          {/* [Bridge] — dynamiczna zmiana implementacji mostu */}
          <select className="border rounded-lg px-2 py-1 text-sm" value={backend} onChange={(e)=>todoStore.setBackend(e.target.value)}>
            <option value="localStorage">localStorage</option>
            <option value="memory">memory</option>
            <option value="mockApi">mockApi</option>
          </select>
          {!ready && <span className="text-slate-400">(ładowanie...)</span>}
        </div>
        {lastError && (
          <div className="bg-red-50 text-red-700 text-xs px-2 py-1 rounded border border-red-200">
            Błąd persystencji: {String(lastError.message || lastError)}
          </div>
        )}
      </div>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="text-3xl font-bold tracking-tight">Kanban – Wzorce (komentowane)</h1>
        <p className="text-slate-500">Factory • Singleton • Builder • Prototype • Facade • Decorator • Bridge</p>
        <div className="mt-6">{view === "board" && <Board />}</div>
      </main>
    </div>
  );
}