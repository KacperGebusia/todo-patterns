// src/bad/BadTodoManager.js
// PRZYKŁAD ANTY‑WZORCA: klasa łamiąca zasady czystego kodu, SRP itp.
// NIE UŻYWAĆ W PRODUKCJI :) TYLKO DO ZADAŃ / PREZENTACJI

export class BadTodoManager {
  constructor(apiUrl, defaultUserName, debugMode, initialTasks, domContainerId) {
    // za dużo odpowiedzialności w konstruktorze
    this.apiUrl = apiUrl;
    this.defaultUserName = defaultUserName;
    this.debugMode = debugMode;
    this.tasks = initialTasks || [];
    this.domContainerId = domContainerId;
    this.lastSyncTime = null;
    this.isLoading = false;
    this.error = null;
    // magiczne klucze, brak stałych
    this.localStorageKey = "todos_data_react_kanban_super_long_key";
  }

  // bardzo długa metoda z wieloma argumentami i zmieszanymi odpowiedzialnościami
  addOrUpdateTaskMaybe(
    id,
    title,
    description,
    status,
    priority,
    dueDate,
    tags,
    shouldScrollIntoView,
    showToast,
    userNameOverride
  ) {
    // walidacja tytułu w tej samej metodzie co logika UI, sieć, itp.
    if (!title || title.trim().length === 0) {
      this.error = "Title is empty, cannot add or update task";
      if (this.debugMode) {
        console.error("[BadTodoManager] validation error", this.error);
      }
      return;
    }

    // wyszukiwanie istniejącego taska
    let existing = null;
    for (let i = 0; i < this.tasks.length; i++) {
      if (this.tasks[i].id === id) {
        existing = this.tasks[i];
        break;
      }
    }

    const now = new Date().toISOString();
    const user = userNameOverride || this.defaultUserName;

    if (existing) {
      // aktualizacja
      existing.title = title;
      existing.description = description;
      existing.status = status;
      existing.priority = priority;
      existing.dueDate = dueDate;
      existing.tags = tags;
      existing.updatedBy = user;
      existing.updatedAt = now;
    } else {
      // dodawanie
      this.tasks.push({
        id: id || crypto.randomUUID(),
        title,
        description,
        status,
        priority,
        dueDate,
        tags,
        createdBy: user,
        createdAt: now,
        updatedBy: user,
        updatedAt: now,
      });
    }

    // zapis do localStorage w środku tej samej metody
    try {
      localStorage.setItem(this.localStorageKey, JSON.stringify(this.tasks));
    } catch (e) {
      this.error = e;
      if (this.debugMode) {
        console.error("[BadTodoManager] localStorage error", e);
      }
    }

    // pseudo‑aktualizacja DOM bez Reacta
    const container = document.getElementById(this.domContainerId);
    if (container) {
      container.innerHTML = ""; // brutalny reset
      this.tasks.forEach((t) => {
        const div = document.createElement("div");
        div.className = "bad-task-item";
        div.innerText = `${t.title} [${t.status}] (P${t.priority})`;
        container.appendChild(div);
      });
      if (shouldScrollIntoView && container.lastElementChild) {
        container.lastElementChild.scrollIntoView({ behavior: "smooth" });
      }
    }

    // pseudo‑toast w tej samej metodzie
    if (showToast) {
      alert("Task saved by " + user);
    }

    // logi debug
    if (this.debugMode) {
      console.log("[BadTodoManager] tasks after add/update", this.tasks);
    }
  }

  // metoda robiąca „wszystko naraz”: synchro z API, zapis, logi, reset, timeouty
  syncWithServerAndMaybeClearEverything(alsoClearLocal, delayMs, onDoneCallback) {
    this.isLoading = true;
    this.error = null;
    if (this.debugMode) {
      console.log("[BadTodoManager] starting sync, delay:", delayMs);
    }

    // „symulacja” opóźnienia
    setTimeout(() => {
      fetch(this.apiUrl + "/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tasks: this.tasks }),
      })
        .then((res) => res.json())
        .then((data) => {
          // mieszanie: od razu nadpisujemy tasks odpowiedzią z serwera
          if (Array.isArray(data.tasks)) {
            this.tasks = data.tasks;
          }
          this.lastSyncTime = new Date().toISOString();

          if (alsoClearLocal) {
            // kasowanie wszystkiego w tej samej metodzie
            this.tasks = [];
            localStorage.removeItem(this.localStorageKey);
          }

          // kolejny fragment UI
          const container = document.getElementById(this.domContainerId);
          if (container) {
            container.classList.add("synced");
            container.dataset.syncedAt = this.lastSyncTime;
          }

          if (this.debugMode) {
            console.log("[BadTodoManager] sync success", {
              lastSyncTime: this.lastSyncTime,
              tasks: this.tasks,
            });
          }

          if (typeof onDoneCallback === "function") {
            // callback jako kolejna odpowiedzialność
            onDoneCallback(null, { tasks: this.tasks, lastSyncTime: this.lastSyncTime });
          }
        })
        .catch((err) => {
          this.error = err;
          if (this.debugMode) {
            console.error("[BadTodoManager] sync error", err);
          }
          if (typeof onDoneCallback === "function") {
            onDoneCallback(err);
          }
        })
        .finally(() => {
          this.isLoading = false;
        });
    }, delayMs || 0);
  }

  // krótka nazwa, ale robi dużo
  lg() {
    // kolejna odpowiedzialność: logowanie stanu
    console.log(
      "[BadTodoManager] dump",
      JSON.stringify(
        {
          apiUrl: this.apiUrl,
          defaultUserName: this.defaultUserName,
          debugMode: this.debugMode,
          tasks: this.tasks,
          lastSyncTime: this.lastSyncTime,
          domContainerId: this.domContainerId,
          error: this.error,
        },
        null,
        2
      )
    );
  }
}
