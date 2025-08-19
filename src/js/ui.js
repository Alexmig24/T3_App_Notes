document.addEventListener("DOMContentLoaded", () => {
  const btnAddNote = document.getElementById("btn-add-note");
  const btnSaveNote = document.getElementById("btn-save-note");
  const btnCancelNote = document.getElementById("btn-cancel-note");
  const notesContainer = document.getElementById("notes-container");
  const emptyMessage = document.getElementById("empty-notes");
  const addNoteSection = document.getElementById("add-note-section");
  const noteTitleInput = document.getElementById("note-title");
  const noteTextInput = document.getElementById("note-text");

  renderNotes();

  btnAddNote.addEventListener("click", () => {
    addNoteSection.style.display = "flex";
    setTimeout(() => noteTitleInput.focus(), 300);
  });

  btnSaveNote.addEventListener("click", () => {
    const title = noteTitleInput.value;
    const text = noteTextInput.value;

    if (!title.trim() || !text.trim()) {
      showNotification("Por favor, completa todos los campos.", "warning");
      return;
    }

    const newNote = window.notesService.addNote(title, text);
    renderNotes();
    clearForm();
    addNoteSection.style.display = "none";
    showNotification("Nota guardada exitosamente!", "success");
  });

  btnCancelNote.addEventListener("click", () => {
    clearForm();
    addNoteSection.style.display = "none";
  });

  // Cerrar modal con ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && addNoteSection.style.display === "flex") {
      clearForm();
      addNoteSection.style.display = "none";
    }
  });

  function renderNotes() {
    const notes = window.notesService.getNotes();
    notesContainer.innerHTML = "";

    if (notes.length === 0) {
      emptyMessage.style.display = "block";
      return;
    }

    emptyMessage.style.display = "none";

    notes.reverse().forEach((note, index) => {
      const card = document.createElement("div");
      card.className = "mdl-card mdl-shadow--2dp note-card";
      card.style.animationDelay = `${index * 0.1}s`;

      card.innerHTML = `
        <div class="mdl-card__title">
          <h2 class="mdl-card__title-text">${escapeHtml(note.title)}</h2>
        </div>
        <div class="mdl-card__supporting-text">
          ${escapeHtml(note.text)}
        </div>
        <div class="mdl-card__menu">
          <button class="mdl-button mdl-js-button mdl-button--icon delete-note-btn" data-id="${note.id}" title="Eliminar nota">
            <i class="material-icons">delete</i>
          </button>
        </div>
        <div class="mdl-card__actions">
          <small class="note-date">${note.date}</small>
        </div>
      `;

      notesContainer.appendChild(card);
    });

    document.querySelectorAll(".delete-note-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const id = parseInt(btn.dataset.id);
        if (confirm("¿Estás seguro de que quieres eliminar esta nota?")) {
          window.notesService.deleteNote(id);
          renderNotes();
          showNotification("Nota eliminada.", "info");
        }
      });
    });
  }

  function clearForm() {
    noteTitleInput.value = "";
    noteTextInput.value = "";
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function showNotification(message, type = "info") {
    // Crear toast notification simple
    const toast = document.createElement("div");
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 16px 24px;
      background: ${type === 'success' ? '#4CAF50' : type === 'warning' ? '#FF9800' : '#2196F3'};
      color: white;
      border-radius: 8px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.2);
      z-index: 10000;
      opacity: 0;
      transform: translateX(100px);
      transition: all 0.3s ease;
      font-size: 14px;
      max-width: 300px;
    `;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.opacity = "1";
      toast.style.transform = "translateX(0)";
    }, 10);
    
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(100px)";
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
  }
});