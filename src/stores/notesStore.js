import { create } from 'zustand';
import { api } from '../api/client';

export const useNotesStore = create((set, get) => ({
  notes: [],
  selectedNote: null,
  isLoading: false,
  error: null,
  search: '',

  fetchNotes: async () => {
    set({ isLoading: true, error: null });
    try {
      const { search } = get();
      const params = search ? { search } : {};
      const notes = await api.getNotes(params);
      set({ notes, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  selectNote: (note) => {
    set({ selectedNote: note });
  },

  addNote: async (note) => {
    try {
      const newNote = await api.createNote(note);
      set({ notes: [newNote, ...get().notes], selectedNote: newNote });
      return newNote;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  updateNote: async (id, updates) => {
    try {
      const updatedNote = await api.updateNote(id, updates);
      set({
        notes: get().notes.map((n) => (n.id === id ? updatedNote : n)),
        selectedNote: get().selectedNote?.id === id ? updatedNote : get().selectedNote,
      });
      return updatedNote;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  deleteNote: async (id) => {
    try {
      await api.deleteNote(id);
      set({
        notes: get().notes.filter((n) => n.id !== id),
        selectedNote: get().selectedNote?.id === id ? null : get().selectedNote,
      });
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  togglePin: async (id) => {
    const note = get().notes.find((n) => n.id === id);
    if (!note) return;
    return get().updateNote(id, { pinned: !note.pinned });
  },

  setSearch: (search) => {
    set({ search });
    get().fetchNotes();
  },
}));
