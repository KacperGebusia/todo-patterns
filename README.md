# Todo Kanban Patterns

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

Aplikacja dostępna będzie pod adresem:  
http://localhost:5173

---

## Struktura projektu

```
src/
 ├── app/
 │   ├── App.jsx                # Główny komponent (Bridge + Strategy + Command + Mediator)
 │   └── main.jsx
 ├── store/
 │   ├── index.js               # Singleton Store + Observer + Bridge + Memento + Strategy(save)
 │   └── StoreContext.jsx       # React Context – integracja Store ↔️ UI
 ├── domain/
 │   └── factory.js             # Factory Method – tworzenie zadań różnych typów
 ├── builder/
 │   └── TaskBuilder.js         # Builder – konstruowanie zadań krok po kroku
 ├── prototype/
 │   └── index.js               # Prototype – klonowanie obiektów zadań
 ├── decorators/
 │   └── index.js               # Decorator – tagowanie, przypinanie
 ├── bridge/
 │   └── storage.js             # Bridge – abstrakcja zapisu danych (localStorage, memory, mockApi)
 ├── interpreter/
 │   ├── lexer.js               # Interpreter – tokenizacja zapytań wyszukiwania
 │   ├── parser.js              # Interpreter – parser składni filtrów
 │   └── evaluator.js           # Interpreter – ewaluacja warunków wyszukiwania
 ├── iterator/
 │   └── TaskIterator.js        # Iterator – paginacja wyników
 ├── state/
 │   ├── config.js              # State – definicja dozwolonych stanów i przejść
 │   └── TaskStateMachine.js    # State – logika maszyny stanów kart
 ├── command/
 │   ├── CommandBus.js          # Command + Memento – globalny Undo/Redo przez snapshoty
 │   ├── commands.js            # Command – implementacje akcji (create, update, delete, move)
 │   └── index.js               # Singleton instancji CommandBus
 ├── strategy/
 │   ├── sort.js                # Strategy(sort) – różne sposoby sortowania kart
 │   └── save.js                # Strategy(save) – różne strategie zapisu (natychmiastowy, debounce, wsadowy)
 ├── mediator/
 │   └── UIBus.js               # Mediator – centralny bus zdarzeń UI (panels, toast, modal)
 ├── kanban/
 │   ├── Board.jsx              # Widok tablicy (Interpreter + Iterator + FSM + Mediator)
 │   ├── Column.jsx             # Kolumna z kartami (State + Mediator)
 │   ├── Card.jsx               # Pojedyncza karta z opcją zmiany stanu
 │   ├── Composer.jsx           # Formularz dodawania kart (Builder + Factory + Command + Mediator)
 │   ├── EditModal.jsx          # Modal edycji kart (Decorator + Mediator)
 │   ├── SearchBar.jsx          # Pasek wyszukiwania (Interpreter + Mediator)
 │   └── ResultsList.jsx        # Widok wyników z paginacją (Iterator)
 ├── memento/
 │   └── Memento.js             # Snapshoty stanu aplikacji (Command + Memento)
 └── styles/
     └── index.css              # Tailwind CSS
```

---

## Zastosowane wzorce projektowe

## LAB 1

### Factory Method
Tworzy instancje różnych typów zadań (`SimpleTask`, `PriorityTask`, `DeadlineTask`) poprzez `TaskFactory.create(type, props)`.

### Singleton
Zapewnia istnienie tylko jednej instancji globalnego `TodoStore` zarządzającego stanem aplikacji.

### Builder
Ułatwia konstruowanie obiektów `Task` krok po kroku z walidacją danych i opcjonalnymi polami.

### Prototype
Klonuje istniejące zadania przy funkcji „Duplikuj”, zachowując metadane.

### Facade
Uproszczony interfejs do operacji na danych (obecnie nieaktywny – zastąpiony Bridge, pozostaje jako przykład).

### Decorator
Dodaje do obiektów zadań funkcje „pinned” i „tags” bez ingerencji w klasę bazową.

### Bridge
Oddziela abstrakcję (interfejs `StorageBridge`) od implementacji backendu (`LocalStorageBackend`, `MemoryBackend`, `MockApiBackend`).

## LAB 2

### Interpreter
Obsługuje język zapytań w wyszukiwarce, np.:
```
status:done tag:work "projekt" before:2025-12-31
```

### Iterator
Umożliwia paginację list wyników — przeglądanie po stronach (domyślnie po 12 kart).

### State
Maszyna stanów opisująca dozwolone przejścia kart (np. `todo → in_progress → done`).

### Command
Ujednolica akcje użytkownika (`Create`, `Move`, `Update`, `Delete`) w obiekty-komendy wykonywane przez `CommandBus`.

### Memento
Umożliwia cofanie i przywracanie stanu (`Undo/Redo`) przez snapshoty całego Store.

### Strategy
Definiuje różne strategie:
- sortowania kart (priorytet, termin, alfabetycznie),
- zapisu (natychmiastowy, debounce, wsadowy).

### Mediator
Koordynuje komunikację między panelami UI:
- `Composer` – dodawanie kart, reaguje na `FOCUS_COMPOSER`,
- `SearchBar` – emituje `SET_QUERY`,
- `EditModal` – otwierany przez `OPEN_EDIT`, zamykany przez `CLOSE_EDIT`,
- `App` – wyświetla `TOAST` po zdarzeniach (np. dodanie, błąd).

---

## Działanie aplikacji

1. Dodanie zadania – `Builder` tworzy obiekt, `Factory` instancjonuje odpowiedni typ, `CommandBus` wykonuje komendę, `Strategy(save)` decyduje o zapisie.  
2. Duplikacja – `Prototype` kopiuje kartę.  
3. Zmienianie statusów – `State` kontroluje dozwolone przejścia.  
4. Edycja – `Mediator` otwiera modal `EditModal`, `Decorator` obsługuje tagi i przypięcia.  
5. Wyszukiwanie – `Interpreter` filtruje po składni zapytań, `Iterator` stronicuje wyniki.  
6. Cofanie / przywracanie – `Command + Memento` odtwarzają historię stanu.  
7. Sortowanie i zapis – użytkownik wybiera strategię (`Strategy`).  
8. Komunikacja UI – `Mediator` synchronizuje Composer, SearchBar i EditModal.

---

## Backend (Bridge)

| Backend | Opis | Trwałość |
|----------|------|----------|
| `localStorage` | zapis w przeglądarce | trwały |
| `memory` | dane w RAM, reset po odświeżeniu | ulotny |
| `mockApi` | symulowane API z opóźnieniem | tymczasowy serwer |

---

## Główne funkcje

- Tablica Kanban z 4 kolumnami (`To Do`, `In Progress`, `Blocked`, `Done`)  
- Wyszukiwarka z językiem zapytań (Interpreter)  
- Cofanie / ponawianie zmian (`Undo/Redo`)  
- Różne strategie sortowania i zapisu  
- Modal edycji i duplikowania kart  
- Toasty z powiadomieniami (Mediator)  
- Paginacja listy wyników (Iterator)  
- Maszyna stanów (State) kontrolująca przepływ zadań  
- Trzy backendy danych (Bridge)

---

## Technologie

- React (Vite)  
- Tailwind CSS  
- Lucide React (ikony)  
- JavaScript (ESNext)

---

## Mapa wzorców i plików

| Wzorzec | Plik / Folder | Opis implementacji |
|----------|----------------|--------------------|
| Factory Method | `src/domain/factory.js` | Tworzenie obiektów `Task` odpowiedniego typu. |
| Singleton | `src/store/index.js`, `src/command/index.js` | Jedna instancja Store i CommandBus. |
| Builder | `src/builder/TaskBuilder.js` | Budowanie obiektu zadania krok po kroku. |
| Prototype | `src/prototype/index.js` | Klonowanie zadań przy duplikacji. |
| Facade | `src/persistence/facade.js` | Uproszczony, nieaktywny interfejs danych. |
| Decorator | `src/decorators/index.js` | Dodawanie tagów i przypięć. |
| Bridge | `src/bridge/storage.js` | Oddzielenie warstwy danych od abstrakcji. |
| Interpreter | `src/interpreter/*` | Parsowanie i ewaluacja zapytań wyszukiwania. |
| Iterator | `src/iterator/TaskIterator.js` | Leniwa paginacja wyników wyszukiwania. |
| State | `src/state/config.js`, `src/state/TaskStateMachine.js` | Maszyna stanów kart (`todo → in_progress → done`). |
| Command | `src/command/commands.js`, `src/command/CommandBus.js` | Abstrakcja akcji użytkownika. |
| Memento | `src/memento/Memento.js`, `src/store/index.js` | Snapshoty stanu dla Undo/Redo. |
| Strategy (sort) | `src/strategy/sort.js` | Różne sposoby sortowania kart. |
| Strategy (save) | `src/strategy/save.js` | Tryby zapisu (natychmiastowy, debounce, wsadowy). |
| Mediator | `src/mediator/UIBus.js` | Bus zdarzeń UI (SearchBar ↔ Board ↔ Composer ↔ EditModal). |
| Observer | `src/store/StoreContext.jsx`, `src/store/index.js` | Aktualizacja komponentów po zmianie Store. |


## Lab 3

### DIP

W ramach laboratorium 3 w projekcie zastosowano zasadę odwracania zależności (DIP).  
Celem było rozdzielenie warstwy aplikacyjnej (przypadki użycia) od detali implementacyjnych (store, toasty, eksport).

### Struktura

Folder: `src/dip/`

- `contracts.js`  
  Zawiera trzy abstrakcyjne interfejsy:
  - `ITaskRepository` – abstrakcja repozytorium zadań (odczyt i zapis listy zadań),
  - `INotifier` – abstrakcja systemu powiadomień (typ + treść komunikatu),
  - `IExporter` – abstrakcja eksportera listy zadań do pliku.

- `abstracts.js`  
  Klasy abstrakcyjne rozszerzające interfejsy o wspólne metody pomocnicze:
  - `AbstractTaskRepository` – helper `filter(tasks, pred)`,
  - `AbstractNotifier` – aliasy `info/success/error` dla `notify`,
  - `AbstractExporter` – helper `fileWithDate(prefix, ext)` do generowania nazw plików.

- `impls.js`  
  Konkrety niskopoziomowe:
  - `LocalStateTaskRepository` – repozytorium oparte o stan aplikacji (todoStore),
  - `ToastNotifier` – implementacja powiadomień wykorzystująca Mediator (`uiBus` i toasty),
  - `CsvExporter` – eksporter zadań do pliku CSV.

- `usecases.js`  
  Warstwa wysokopoziomowa (logika aplikacyjna), która zależy wyłącznie od abstrakcji:
  - `TaskUseCases` – przyjmuje w konstruktorze `ITaskRepository`, `INotifier`, `IExporter`,
  - `completeAllInStatus(status)` – masowo zamyka karty o danym statusie,
  - `exportDone()` – eksportuje wszystkie ukończone karty do pliku i zwraca obiekt pliku.

- `wiring.js`  
  Miejsce, w którym następuje składanie zależności (kompozycja):
  - tworzone są konkretne implementacje: `LocalStateTaskRepository`, `ToastNotifier`, `CsvExporter`,
  - tworzone są przypadki użycia: `new TaskUseCases(repo, notifier, exporter)`,
  - eksportowany jest kontener:
    ```js
    export const dipContainer = { repo, notifier, exporter, usecases };
    ```

### Integracja z App.jsx

W pliku `src/app/App.jsx` dodano dwa przyciski 

### ISP

Drugą częścią laboratorium 3 jest zastosowanie zasady **segregacji interfejsów (ISP)**.  
Zamiast tworzyć „grube” interfejsy, które zawierają zbyt wiele metod naraz, projekt dzieli je na mniejsze, spójne kontrakty.  
Każda klasa implementuje tylko te interfejsy, których naprawdę potrzebuje.

### Struktura

Folder: `src/isp/`

- `fat.js`  
  Zawiera 3 przykładowe „grube” interfejsy (anty-przykład ISP):
  - `ITaskServiceFat` – łączy w sobie: odczyt, zapis, tworzenie, aktualizację, usuwanie, ruch kart i operacje masowe,
  - `IExportServiceFat` – wymaga jednocześnie obsługi eksportu do CSV, JSON i ICS,
  - `INotifyServiceFat` – wymaga zaimplementowania toast/alert/confirm/logów w jednej klasie.

- `segregated.js`  
  Zawiera podział tych „grubych” interfejsów na małe, wyspecjalizowane kontrakty:
  - repozytorium zadań:
    - `ITaskReader` – tylko odczyt listy zadań,
    - `ITaskWriter` – tylko zapis listy zadań,
    - `ITaskCreator` – tylko tworzenie,
    - `ITaskUpdater` – tylko aktualizacja,
    - `ITaskRemover` – tylko usuwanie,
    - `ITaskMover` – tylko przenoszenie kart między kolumnami,
    - `ITaskBulkCloser` – tylko hurtowe zamykanie zadań;
  - eksport:
    - `IExportCSV` – eksport do CSV,
    - `IExportJSON` – eksport do JSON,
    - `IExportICS` – eksport do ICS (kalendarz);
  - powiadomienia:
    - `IToast` – toasty,
    - `IAlert` – alerty,
    - `IConfirm` – potwierdzenia,
    - `ILog` – logowanie.

- `impls.js`  
  Konkretne implementacje wąskich interfejsów:
  - `StoreTaskReader`, `StoreTaskWriter`, `StoreTaskCreator`, `StoreTaskUpdater`, `StoreTaskRemover`, `StoreTaskMover`, `StoreTaskBulkCloser` – operują na `todoStore`, każdy realizuje tylko jedną grupę operacji,
  - `ExportCSV`, `ExportJSON`, `ExportICS` – osobne klasy odpowiedzialne za pojedynczy format eksportu,
  - `ToastNotifier`, `AlertNotifier`, `ConfirmDialog`, `ConsoleLogger` – wyspecjalizowane implementacje dla powiadomień.

- `adapter-fat.js`  
  Adaptery, które składają „grube” interfejsy z wielu małych:
  - `TaskServiceAdapter` – implementuje `ITaskServiceFat`, ale wewnętrznie korzysta z: `ITaskReader`, `ITaskWriter`, `ITaskCreator`, `ITaskUpdater`, `ITaskRemover`, `ITaskMover`, `ITaskBulkCloser`,
  - `ExportServiceAdapter` – implementuje `IExportServiceFat` na bazie `IExportCSV`, `IExportJSON`, `IExportICS`,
  - `NotifyServiceAdapter` – implementuje `INotifyServiceFat` na bazie `IToast`, `IAlert`, `IConfirm`, `ILog`.

- `wiring.js`  
  Plik odpowiedzialny za kompozycję obiektów i proste przypadki użycia oparte na wąskich interfejsach:
  - tworzy instancje: `StoreTaskReader`, `StoreTaskWriter`, `StoreTaskBulkCloser`, `ExportCSV`, `ExportJSON`, `ExportICS`, `ToastNotifier` itd.,
  - tworzy adaptery „grubych” interfejsów: `taskServiceFat`, `exportServiceFat`, `notifyServiceFat` (jeśli gdzieś wymagane jest stare API),
  - eksportuje dwa przykładowe use-cases:
    - `closeAllInStatus(status)` – korzysta tylko z `reader`, `writer` i `toast`, masowo zamyka karty w zadanym statusie,
    - `exportDoneAs(format)` – czyta ukończone zadania, wybiera odpowiedni eksporter (`csv/json/ics`) i zwraca obiekt pliku.

### Integracja z App.jsx

W pliku `src/app/App.jsx` można pokazać działanie ISP poprzez dwa przyciski w toolbarze:
