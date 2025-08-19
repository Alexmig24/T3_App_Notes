const NOTES_KEY = "quick_jot_notes";
function getNotes() {
  return JSON.parse(localStorage.getItem(NOTES_KEY)) || [];
}

function saveNotes(notes) {
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
}

function addNote(title, text) {
  const notes = getNotes();
  const newNote = {
    id: Date.now(),
    title: title.trim(),
    text: text.trim(),
    date: new Date().toLocaleString('es-ES', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  };
  notes.push(newNote);
  saveNotes(notes);
  return newNote;
}

function deleteNote(id) {
  const notes = getNotes().filter(note => note.id !== id);
  saveNotes(notes);
}

window.notesService = {
  getNotes,
  addNote,
  deleteNote
};