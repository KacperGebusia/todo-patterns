# Todo Patterns

Autorzy:  
**Jakub Derkacz**  
**Kacper Gębusia**

---

## Uruchomienie projektu

### Instalacja zależności
```bash
npm install
```

### Uruchomienie w trybie developerskim
```bash
npm run dev
```

Aplikacja będzie dostępna pod adresem:
[http://localhost:5173](http://localhost:5173)

---

## Struktura projektu

```
src/
 ├── App.jsx                    # główny komponent aplikacji (Bridge + Decorator + Facade + Prototype + Edycja)
 ├── store.js                   # Singleton Store z obsługą Bridge
 ├── StoreContext.jsx           # React Context do komunikacji Store ↔️ UI
 ├── prototype.js               # Prototype pattern – klonowanie obiektów zadań
 ├── decorators.js              # Decorator pattern – przypinanie (pinned) i tagowanie (tags)
 ├── bridge/
 │    └── storage.js            # Bridge pattern – separacja abstrakcji Storage od backendów
 ├── persistence/
 │    └── facade.js             # Facade pattern – uproszczony interfejs do persystencji
 ├── taskBuilder.js             # Builder pattern – konstruktor obiektu Task z walidacją
 └── components/
      └── (opcjonalne komponenty UI, np. TypeBadge, Tag, itp.)
```

---

## Zastosowane wzorce projektowe

### **Factory Method**
> Tworzenie obiektów `Task` różnych typów bez ujawniania logiki tworzenia w klasie nadrzędnej.

**Plik:** `src/App.jsx`  
**Klasy:**  
- `TaskFactory` – fabryka z metodą `create(type, props)`  
- `SimpleTask`, `PriorityTask`, `DeadlineTask` – konkretne implementacje

---

### **Singleton**
> Zapewnia istnienie tylko jednej instancji globalnego Store w aplikacji.

**Plik:** `src/store.js`  
**Klasa:** `TodoStore`  
**Metoda:** `getInstance()`

---

### **Builder**
> Ułatwia konstruowanie obiektów `Task` krok po kroku z walidacją danych.

**Plik:** `src/taskBuilder.js`  
**Klasa:** `TaskBuilder` – metody `.title()`, `.type()`, `.priority()`, `.due()`, `.build()`

---

### **Prototype**
> Klonowanie istniejących obiektów `Task` (np. funkcja "Duplikuj").

**Plik:** `src/prototype.js`  
**Funkcja:** `cloneTask(task, overrides)`

---

### **Facade**
> Ujednolicony interfejs do operacji na persystencji (LocalStorage, API, Memory).

**Plik:** `src/persistence/facade.js`  
**Klasa:** `PersistenceFacade`  
**Implementacje:** `LocalStorageDriver`, `MemoryDriver`

---

### **Decorator**
> Dynamiczne rozszerzanie obiektu `Task` o dodatkowe funkcje (`pinned`, `tags`) bez zmiany klasy bazowej.

**Plik:** `src/decorators.js`  
**Funkcje:**  
- `togglePinned(task)`  
- `addTags(task, tags)`  
- `removeTag(task, tag)`  
- `setTags(task, tagsArray)`

---

### **Bridge**
> Oddzielenie **abstrakcji** (interfejs `StorageBridge`) od **implementacji backendu** (`LocalStorageBackend`, `MemoryBackend`, `MockApiBackend`).

**Plik:** `src/bridge/storage.js`  
**Klasy:**  
- `StorageBridge` – główny most łączący aplikację z backendem  
- `LocalStorageBackend`, `MemoryBackend`, `MockApiBackend`

---

## Działanie aplikacji

1. Użytkownik dodaje nowe zadanie — `TaskFactory` tworzy odpowiedni obiekt (`SimpleTask`, `PriorityTask` itd.).  
2. `TodoStore` (Singleton) przechowuje listę zadań i emituje zmiany do kontekstu React (`StoreContext`).  
3. `PersistenceFacade` (lub `StorageBridge`) zapisuje dane lokalnie lub w mockowanym API.  
4. `Decorator` pozwala dodać do zadania tagi i oznaczenie „pinned” bez ingerencji w jego klasę.  
5. `Prototype` umożliwia duplikację zadania z jednym kliknięciem.  
6. `Builder` upraszcza tworzenie i walidację danych wejściowych.  
7. `Bridge` pozwala zmienić backend (np. `localStorage`, `memory`, `mockApi`) jednym wyborem z menu.

---

## Dostępne backendy (Bridge)

| Backend | Opis | Trwałość |
|----------|------|----------|
| `localStorage` | zapis do pamięci przeglądarki | trwały |
| `memory` | przechowywanie danych tylko w RAM | ulotny |
| `mockApi` | symulowane REST API z opóźnieniem | symulacja serwera |

---

## Kluczowe funkcje aplikacji

- Dodawanie, edycja, usuwanie i duplikacja zadań  
- Sortowanie po tytule, typie, terminie, priorytecie  
- Przypinanie (pinned) i tagowanie (tags) zadań  
- Edycja inline z walidacją danych  
- Wybór backendu w czasie działania  
- Trwałość danych w `localStorage` lub backendzie mockowanym  

---

## Technologie

- **React**  
- **Vite**  
- **Tailwind CSS**  
- **Lucide React** 
- **JavaScript**

