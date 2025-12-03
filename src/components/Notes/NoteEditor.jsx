import { useState, useEffect, useCallback } from 'react';
import { Eye, Edit3, Save, Pin, Trash2 } from 'lucide-react';
import { clsx } from 'clsx';
import ReactMarkdown from 'react-markdown';
import { useNotesStore } from '../../stores/notesStore';
import { Button, Input } from '../UI';

const noteColors = [
  '#1e293b', // default dark
  '#1e3a5f', // blue
  '#1e3a3a', // teal
  '#3a1e3a', // purple
  '#3a2a1e', // brown
  '#1e3a1e', // green
];

export function NoteEditor({ note, onSave }) {
  const { updateNote, deleteNote, togglePin } = useNotesStore();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState('#1e293b');
  const [isPreview, setIsPreview] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setContent(note.content || '');
      setColor(note.color || '#1e293b');
      setHasChanges(false);
      setIsPreview(false);
    }
  }, [note?.id]);

  const handleChange = useCallback((field, value) => {
    if (field === 'title') setTitle(value);
    if (field === 'content') setContent(value);
    if (field === 'color') setColor(value);
    setHasChanges(true);
  }, []);

  const handleSave = async () => {
    if (!note) return;
    await updateNote(note.id, { title, content, color });
    setHasChanges(false);
    onSave?.();
  };

  const handleDelete = async () => {
    if (!note) return;
    if (confirm('Are you sure you want to delete this note?')) {
      await deleteNote(note.id);
    }
  };

  if (!note) {
    return (
      <div className="h-full flex items-center justify-center text-moon-500">
        <div className="text-center">
          <Edit3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Select a note or create a new one</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-moon-700">
        <div className="flex items-center gap-2">
          {noteColors.map((c) => (
            <button
              key={c}
              onClick={() => handleChange('color', c)}
              className={clsx(
                'w-6 h-6 rounded-full border-2 transition-all',
                color === c ? 'border-white scale-110' : 'border-transparent'
              )}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => togglePin(note.id)}
            className={note.pinned ? 'text-yellow-400' : ''}
          >
            <Pin className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsPreview(!isPreview)}
          >
            {isPreview ? (
              <Edit3 className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 text-red-400" />
          </Button>
          {hasChanges && (
            <Button size="sm" onClick={handleSave} icon={Save}>
              Save
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col" style={{ backgroundColor: color }}>
        <div className="p-4 pb-0">
          <input
            type="text"
            value={title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="Note title..."
            className="w-full text-2xl font-bold bg-transparent text-moon-100 placeholder-moon-500 border-none focus:outline-none"
          />
        </div>

        <div className="flex-1 p-4 overflow-auto">
          {isPreview ? (
            <div className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown>{content || '*No content yet*'}</ReactMarkdown>
            </div>
          ) : (
            <textarea
              value={content}
              onChange={(e) => handleChange('content', e.target.value)}
              placeholder="Start writing... (Markdown supported)"
              className="w-full h-full bg-transparent text-moon-200 placeholder-moon-500 border-none focus:outline-none resize-none font-mono text-sm leading-relaxed"
            />
          )}
        </div>
      </div>
    </div>
  );
}
