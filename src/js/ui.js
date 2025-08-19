document.addEventListener("DOMContentLoaded", () => {
  const btnAddNote = document.getElementById("btn-add-note");
  const btnSaveNote = document.getElementById("btn-save-note");
  const btnCancelNote = document.getElementById("btn-cancel-note");
  const notesContainer = document.getElementById("notes-container");
  const emptyMessage = document.getElementById("empty-notes");
  const addNoteSection = document.getElementById("add-note-section");
  const noteTitleInput = document.getElementById("note-title");
  const noteTextInput = document.getElementById("note-text");

  // Mostrar notas existentes
  renderNotes();

  // Abrir formulario
  btnAddNote.addEventListener("click", () => {
    addNoteSection.style.display = "flex";
  });

  // Guardar nota
  btnSaveNote.addEventListener("click", () => {
    const title = noteTitleInput.value;
    const text = noteTextInput.value;

    if (!title.trim() || !text.trim()) {
      alert("Por favor, completa todos los campos.");
      return;
    }

    const newNote = window.notesService.addNote(title, text);
    renderNotes();
    clearForm();
    addNoteSection.style.display = "none";
  });

  // Cancelar
  btnCancelNote.addEventListener("click", () => {
    clearForm();
    addNoteSection.style.display = "none";
  });

  // Renderizar todas las notas
  function renderNotes() {
    const notes = window.notesService.getNotes();
    notesContainer.innerHTML = "";

    if (notes.length === 0) {
      emptyMessage.style.display = "block";
      return;
    }

    emptyMessage.style.display = "none";

    notes.forEach(note => {
      const card = document.createElement("div");
      card.className = "mdl-card mdl-shadow--2dp mdl-cell mdl-cell--4-col note-card";

      card.innerHTML = `
        <div class="mdl-card__title">
          <h2 class="mdl-card__title-text">${note.title}</h2>
        </div>
        <div class="mdl-card__supporting-text">
          ${note.text}
        </div>
        <div class="mdl-card__menu">
          <button class="mdl-button mdl-js-button mdl-button--icon delete-note-btn mdl-color-text--white" data-id="${note.id}">
            <i class="material-icons">delete</i>
          </button>
        </div>
        <div class="mdl-card__actions mdl-card--border mdl-color-text--light-gray">
          <small class="mdl-color-text--light-gray">${note.date}</small>
        </div>
      `;

      notesContainer.appendChild(card);
    });

    // Eventos para eliminar notas
    document.querySelectorAll(".delete-note-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = parseInt(btn.dataset.id);
        window.notesService.deleteNote(id);
        renderNotes();
      });
    });
  }

  // Limpiar formulario
  function clearForm() {
    noteTitleInput.value = "";
    noteTextInput.value = "";
  }
});