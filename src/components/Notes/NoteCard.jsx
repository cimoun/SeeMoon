import { format } from 'date-fns';
import { Pin, Trash2 } from 'lucide-react';
import { clsx } from 'clsx';
import ReactMarkdown from 'react-markdown';
import { useNotesStore } from '../../stores/notesStore';

export function NoteCard({ note, isSelected, onClick }) {
  const { deleteNote, togglePin } = useNotesStore();

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this note?')) {
      await deleteNote(note.id);
    }
  };

  const handleTogglePin = async (e) => {
    e.stopPropagation();
    await togglePin(note.id);
  };

  return (
    <div
      onClick={onClick}
      className={clsx(
        'group relative p-4 rounded-xl border cursor-pointer transition-all',
        isSelected
          ? 'bg-primary-900/30 border-primary-600'
          : 'bg-moon-800 border-moon-700 hover:border-moon-600'
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-medium text-moon-100 truncate flex-1">
          {note.title || 'Untitled'}
        </h3>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleTogglePin}
            className={clsx(
              'p-1.5 rounded-lg transition-colors',
              note.pinned
                ? 'text-yellow-400 hover:text-yellow-300'
                : 'text-moon-500 hover:text-moon-300'
            )}
          >
            <Pin className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            className="p-1.5 rounded-lg text-moon-500 hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="text-sm text-moon-400 line-clamp-3 prose-sm">
        <ReactMarkdown
          components={{
            p: ({ children }) => <span>{children}</span>,
            h1: ({ children }) => <span>{children}</span>,
            h2: ({ children }) => <span>{children}</span>,
            h3: ({ children }) => <span>{children}</span>,
          }}
        >
          {note.content?.slice(0, 200) || 'No content'}
        </ReactMarkdown>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-moon-700">
        <span className="text-xs text-moon-500">
          {format(new Date(note.updated_at), 'MMM d, yyyy')}
        </span>
        {note.pinned && <Pin className="w-3 h-3 text-yellow-500" />}
      </div>
    </div>
  );
}
