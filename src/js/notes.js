const NOTES_KEY = "quick_jot_notes";

// Obtener todas las notas desde localStorage
function getNotes() {
  return JSON.parse(localStorage.getItem(NOTES_KEY)) || [];
}

// Guardar todas las notas en localStorage
function saveNotes(notes) {
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
}

// Agregar nueva nota
function addNote(title, text) {
  const notes = getNotes();
  const newNote = {
    id: Date.now(),
    title: title.trim(),
    text: text.trim(),
    date: new Date().toLocaleString()
  };
  notes.push(newNote);
  saveNotes(notes);
  return newNote;
}

// Eliminar nota
function deleteNote(id) {
  const notes = getNotes().filter(note => note.id !== id);
  saveNotes(notes);
}

// Exportar funciones
window.notesService = {
  getNotes,
  addNote,
  deleteNote
};
