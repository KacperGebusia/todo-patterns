// Layout + toolbar
// [PATTERN: Bridge] — UŻYCIE: zmiana backendu komendą
// [PATTERN: Command + Memento] — UŻYCIE: Undo/Redo przez commandBus
import { useEffect, useState } from "react";
import { Database, RotateCcw, RotateCw } from "lucide-react";
import { useStore } from "../store/StoreContext";
import Board from "../kanban/Board";
import { commandBus } from "../command/CommandBus";
import { SwitchBackendCommand } from "../command/commands/SwitchBackendCommand";
export default function App(){
  const { backend, lastError, ready } = useStore();
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  useEffect(()=> commandBus.onChange(({canUndo, canRedo}) => { setCanUndo(!!canUndo); setCanRedo(!!canRedo); }),[]);
  function onBackendChange(e){ commandBus.execute(new SwitchBackendCommand(e.target.value)); }
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex flex-wrap items-center gap-3 px-4 py-2 border-b bg-white">
        <div className="inline-flex items-center gap-2 text-sm text-slate-600">
          <Database size={16} /><span>Backend:</span>
          <select className="border rounded-lg px-2 py-1 text-sm" value={backend} onChange={onBackendChange}>
            <option value="localStorage">localStorage</option><option value="memory">memory</option><option value="mockApi">mockApi</option>
          </select>
          {!ready && <span className="text-slate-400">(ładowanie...)</span>}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button disabled={!canUndo} onClick={()=>commandBus.undo()}
            className={`px-3 py-1 rounded-lg border inline-flex items-center gap-1 ${canUndo? "bg-white" : "bg-slate-100 text-slate-400 cursor-not-allowed"}`}>
            <RotateCcw size={16}/> Cofnij
          </button>
          <button disabled={!canRedo} onClick={()=>commandBus.redo()}
            className={`px-3 py-1 rounded-lg border inline-flex items-center gap-1 ${canRedo? "bg-white" : "bg-slate-100 text-slate-400 cursor-not-allowed"}`}>
            <RotateCw size={16}/> Ponów
          </button>
        </div>
        {lastError && (<div className="bg-red-50 text-red-700 text-xs px-2 py-1 rounded border border-red-200">Błąd persystencji: {String(lastError.message || lastError)}</div>)}
      </div>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="text-3xl font-bold tracking-tight">Kanban – Undo/Redo (Command + Memento)</h1>
        <p className="text-slate-500">Cofanie/ponawianie dodawania, edycji, usuwania, przenoszenia i zmiany backendu.</p>
        <div className="mt-6"><Board /></div>
      </main>
    </div>
  );
}
