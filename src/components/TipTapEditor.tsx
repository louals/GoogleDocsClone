import { useState, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline'; // Standard in Word
import { auth, db } from '../firebase-config';
import { 
  doc, 
  onSnapshot, 
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Users,
  Clock,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  RotateCcw,
  RotateCw,
  Type
} from 'lucide-react';
import '../styles/TipTapEditor.css'; // See the CSS block below

export const TipTapEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string>('');
  const [title, setTitle] = useState('Untitled Document');
  const [, setSharedUsers] = useState<string[]>([]);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isLocalChange = useRef(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const user = auth.currentUser;
  const docRef = doc(db, 'documents', id!);

  // 1. Initialize Editor with Autofocus
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Placeholder.configure({
        placeholder: 'Start writing your document...',
      }),
    ],
    autofocus: 'end', // Cursor active on page load
    content: '',
    onUpdate: ({ editor: ed }) => {
      isLocalChange.current = true;
      setIsSaving(true);

      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      
      saveTimeoutRef.current = setTimeout(async () => {
        try {
          await updateDoc(docRef, {
            content: ed.getHTML(),
            updatedAt: serverTimestamp(),
            lastEditor: user?.email
          });
          setLastSaved(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
          setIsSaving(false);
        } catch (error) {
          console.error('Error saving:', error);
          setIsSaving(false);
        }
      }, 1000);
    },
  });

  // 2. Load Firebase Data
  useEffect(() => {
    if (!id || !user) {
      navigate('/dashboard');
      return;
    }

    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (!snapshot.exists()) return;

      const data = snapshot.data();
      
      if (data.ownerId !== user.uid && !data.sharedWith?.includes(user.uid)) {
        navigate('/dashboard');
        return;
      }

      if (data.title && !isEditingTitle) setTitle(data.title);
      if (data.sharedWith) setSharedUsers(data.sharedWith);
      if (data.updatedAt?.toDate) {
        setLastSaved(data.updatedAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }

      if (editor && !isLocalChange.current) {
        const remoteContent = data.content || '';
        if (remoteContent !== editor.getHTML()) {
          editor.commands.setContent(remoteContent);
        }
      }
      isLocalChange.current = false;
    });

    return () => unsubscribe();
  }, [id, user, navigate, isEditingTitle, editor]);

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      await updateDoc(docRef, { title: newTitle || 'Untitled Document' });
    }, 1000);
  };

  if (!editor || !user) return <div className="loading-screen">Opening Document...</div>;

  return (
    <div className="docs-container">
      {/* WORD/DOCS HEADER */}
      <header className="docs-header">
        <div className="docs-nav">
          <button onClick={() => navigate('/dashboard')} className="docs-back-btn">
            <img src="/document.png" alt="logo" className="docs-logo" />
          </button>
          
          <div className="docs-title-wrapper">
            <div className="docs-title-row">
              {isEditingTitle ? (
                <input
                  ref={titleInputRef}
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  onBlur={() => setIsEditingTitle(false)}
                  onKeyDown={(e) => e.key === 'Enter' && titleInputRef.current?.blur()}
                  className="docs-title-input"
                  autoFocus
                />
              ) : (
                <span className="docs-title-text" onClick={() => setIsEditingTitle(true)}>
                  {title}
                </span>
              )}
              <div className="docs-save-indicator">
                {isSaving ? 'Saving...' : <Clock size={14} />}
              </div>
            </div>
            
            <nav className="docs-menu-bar">
              <span>File</span><span>Edit</span><span>View</span><span>Insert</span><span>Format</span><span>Tools</span>
            </nav>
          </div>

 <div className="user-avatar">{user.email?.charAt(0).toUpperCase()}</div>
          <div className="docs-header-actions">
            <button className="docs-share-btn">
                
              <Users size={16} /> Share
            </button>
           
          </div>
        </div>

        {/* WORD TOOLBAR */}
        <div className="docs-toolbar">
          <div className="toolbar-section">
            <button onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}><RotateCcw size={18}/></button>
            <button onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}><RotateCw size={18}/></button>
          </div>
          <div className="divider" />
          <div className="toolbar-section">
            <button 
              onClick={() => editor.chain().focus().toggleBold().run()} 
              className={editor.isActive('bold') ? 'is-active' : ''}
            ><Bold size={18}/></button>
            <button 
              onClick={() => editor.chain().focus().toggleItalic().run()} 
              className={editor.isActive('italic') ? 'is-active' : ''}
            ><Italic size={18}/></button>
            <button 
              onClick={() => editor.chain().focus().toggleUnderline().run()} 
              className={editor.isActive('underline') ? 'is-active' : ''}
            ><UnderlineIcon size={18}/></button>
          </div>
          <div className="divider" />
          <div className="toolbar-section">
            <button 
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} 
              className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}
            ><Type size={18}/>1</button>
            <button 
              onClick={() => editor.chain().focus().toggleBulletList().run()} 
              className={editor.isActive('bulletList') ? 'is-active' : ''}
            ><List size={18}/></button>
            <button 
              onClick={() => editor.chain().focus().toggleOrderedList().run()} 
              className={editor.isActive('orderedList') ? 'is-active' : ''}
            ><ListOrdered size={18}/></button>
          </div>
        </div>
      </header>

      {/* THE PAGE CANVAS */}
      <main className="docs-canvas">
        <div className="docs-page">
          <EditorContent editor={editor} />
        </div>
        <div className="docs-footer-info">
          Last saved {lastSaved}
        </div>
      </main>
    </div>
  );
};