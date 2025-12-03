import { useEffect, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { useNotesStore } from '../../stores/notesStore';
import { Button, Input, Card } from '../UI';
import { NoteCard } from './NoteCard';
import { NoteEditor } from './NoteEditor';

export function NotesPage() {
  const {
    notes,
    selectedNote,
    isLoading,
    search,
    fetchNotes,
    selectNote,
    addNote,
    setSearch,
  } = useNotesStore();
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const handleCreateNote = async () => {
    const note = await addNote({
      title: 'Untitled Note',
      content: '',
    });
    selectNote(note);
  };

  const pinnedNotes = notes.filter((n) => n.pinned);
  const otherNotes = notes.filter((n) => !n.pinned);

  return (
    <div className="h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-moon-100">Notes</h1>
          <p className="text-moon-400 mt-1">{notes.length} notes</p>
        </div>
        <Button icon={Plus} onClick={handleCreateNote}>
          New Note
        </Button>
      </div>

      <div className="flex gap-6 h-[calc(100%-5rem)]">
        {/* Notes List */}
        <div className="w-80 flex-shrink-0 flex flex-col">
          <form onSubmit={handleSearch} className="mb-4">
            <Input
              placeholder="Search notes..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              icon={Search}
            />
          </form>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
            </div>
          ) : notes.length === 0 ? (
            <Card className="text-center py-8">
              <p className="text-moon-500 mb-4">
                {search ? 'No notes found' : 'No notes yet'}
              </p>
              {!search && (
                <Button size="sm" onClick={handleCreateNote}>
                  Create Note
                </Button>
              )}
            </Card>
          ) : (
            <div className="flex-1 overflow-auto space-y-3 pr-2">
              {pinnedNotes.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-medium text-moon-500 uppercase tracking-wide px-1">
                    Pinned
                  </h3>
                  {pinnedNotes.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      isSelected={selectedNote?.id === note.id}
                      onClick={() => selectNote(note)}
                    />
                  ))}
                </div>
              )}

              {otherNotes.length > 0 && (
                <div className="space-y-2">
                  {pinnedNotes.length > 0 && (
                    <h3 className="text-xs font-medium text-moon-500 uppercase tracking-wide px-1 mt-4">
                      All Notes
                    </h3>
                  )}
                  {otherNotes.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      isSelected={selectedNote?.id === note.id}
                      onClick={() => selectNote(note)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Note Editor */}
        <Card padding={false} className="flex-1 overflow-hidden">
          <NoteEditor note={selectedNote} />
        </Card>
      </div>
    </div>
  );
}
