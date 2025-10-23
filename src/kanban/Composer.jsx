// Formularz dodawania
import { useState } from "react";
import { PlusCircle } from "lucide-react";
import { TaskFactory } from "../domain/factory";
import { TaskBuilder } from "../builder/TaskBuilder";
import { useStore } from "../store/StoreContext";
const STATUSES = [{ value: "todo", label: "To Do" },{ value: "in_progress", label: "In Progress" },{ value: "blocked", label: "Blocked" },{ value: "done", label: "Done" }];
export default function Composer() {
  const { todoStore } = useStore();
  const [title, setTitle] = useState(""); const [type, setType] = useState("simple"); const [status, setStatus] = useState("todo");
  const [priority, setPriority] = useState(2); const [due, setDue] = useState(()=>new Date(Date.now()+86400000).toISOString().slice(0,16)); const [error, setError] = useState("");
  async function onSubmit(e){ e?.preventDefault?.(); setError(""); try{
      const b = new TaskBuilder().title(title).type(type).status(status);
      if (type === "priority") b.priority(priority);
      if (type === "deadline") b.due(due);
      const props = b.build(); const task = TaskFactory.create(type, props); await todoStore.createIn(status, task); setTitle("");
    } catch(err){ setError(err?.message || "Nie udało się dodać zadania."); } }
  return (
    <form onSubmit={onSubmit} className="bg-white rounded-2xl shadow p-4 grid grid-cols-1 md:grid-cols-6 gap-3">
      <div className="md:col-span-2 flex items-center gap-2 border rounded-xl px-3">
        <PlusCircle /><input value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Dodaj kartę..." className="w-full py-2 outline-none"/>
      </div>
      <select value={type} onChange={(e)=>setType(e.target.value)} className="border rounded-xl px-3 py-2">
        <option value="simple">Simple</option><option value="priority">Priority</option><option value="deadline">Deadline</option>
      </select>
      {type==="priority" && (<input type="number" min={1} max={5} value={priority} onChange={(e)=>setPriority(e.target.value)} className="border rounded-xl px-3 py-2" placeholder="Priorytet 1-5"/>)}
      {type==="deadline" && (<input type="datetime-local" value={due} onChange={(e)=>setDue(e.target.value)} className="border rounded-xl px-3 py-2"/>)}
      <select value={status} onChange={(e)=>setStatus(e.target.value)} className="border rounded-xl px-3 py-2">
        {STATUSES.map(s=> <option key={s.value} value={s.value}>{s.label}</option>)}
      </select>
      <button type="submit" className="rounded-xl bg-slate-900 text-white px-4 py-2">Dodaj</button>
      {error && <div className="md:col-span-6 text-sm text-red-600">{error}</div>}
    </form> );
}