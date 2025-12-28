import { useState, useEffect } from 'react';
import { auth, db } from '../firebase-config';
import { 
  collection, query, where, onSnapshot, addDoc, 
  deleteDoc, doc, serverTimestamp, orderBy 
} from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, FileText, Trash2, LogOut, Search, 
  MoreVertical, List as ListIcon, FolderOpen 
} from 'lucide-react';
import { signOut } from 'firebase/auth';
import '../styles/Dashboard.css';

export const Dashboard = () => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) { navigate('/login'); return; }

    const docsQuery = query(
      collection(db, 'documents'),
      where('ownerId', '==', user.uid),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(docsQuery, (snapshot) => {
      setDocuments(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, navigate]);

  const createDocument = async () => {
    const docRef = await addDoc(collection(db, 'documents'), {
      title: 'Untitled Document',
      ownerId: user?.uid,
      content: '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    navigate(`/doc/${docRef.id}`);
  };

  if (loading) return <div className="loader-container"><div className="google-loader"></div></div>;

  return (
    <div className="docs-dashboard">
      <header className="dash-header">
        <div className="dash-header-left">
          
          <img src="/document.png" alt="Docs" />
          <span className="brand-text">Documents</span>
        </div>

        <div className="dash-search-container">
          <div className="dash-search-bar">
            <button className="icon-btn search-icon-btn"><Search size={20} /></button>
            <input 
              placeholder="Search" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="dash-header-right">
          <button onClick={() => signOut(auth)} className="logout-pill">
            <LogOut size={16} /> Logout
          </button>
          <div className="user-avatar-circle">
            {user?.email?.charAt(0).toUpperCase()}
          </div>
        </div>
      </header>

      <section className="template-outer">
        <div className="standard-container">
          <div className="section-title-row">
            <span>Start a new document</span>
            <button className="text-link">Template gallery</button>
          </div>
          <div className="template-grid">
            <div className="template-item" onClick={createDocument}>
              <div className="template-thumb blank-plus">
                <Plus size={48} color="#4285f4" strokeWidth={1} />
              </div>
              <label>Blank</label>
            </div>
            {['Resume', 'Letter', 'Proposal'].map(t => (
              <div key={t} className="template-item">
                <div className="template-thumb mock-thumb"></div>
                <label>{t}</label>
              </div>
            ))}
          </div>
        </div>
      </section>

      <main className="recent-outer">
        <div className="standard-container">
          <div className="recent-header-row">
            <span className="recent-label">Recent documents</span>
            <div className="recent-actions">
              <button className="action-pill">Owned by anyone <MoreVertical size={14}/></button>
              <div className="view-mode-toggle">
                <ListIcon size={18} />
              </div>
              <FolderOpen size={18} className="folder-icon" />
            </div>
          </div>

          <div className="docs-list-container">
            <div className="list-thead">
              <span className="th-name">Name</span>
              <span className="th-owner">Owner</span>
              <span className="th-date">Last opened</span>
              <span className="th-icon"></span>
            </div>

            {documents.length === 0 ? (
              <div className="empty-state">
                <img src="https://ssl.gstatic.com/docs/documents/images/empty_state_files_v1.svg" alt="empty" />
                <p>No documents yet. Click "Blank" to start!</p>
              </div>
            ) : (
              documents.filter(d => d.title.toLowerCase().includes(search.toLowerCase())).map((docItem) => (
                <div key={docItem.id} className="doc-row" onClick={() => navigate(`/doc/${docItem.id}`)}>
                  <div className="td-name">
                    <FileText size={18} color="#4285f4" fill="#4285f4" fillOpacity={0.1} />
                    <span className="doc-title-text">{docItem.title}</span>
                  </div>
                  <div className="td-owner">me</div>
                  <div className="td-date">
                    {docItem.updatedAt?.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  <div className="td-action">
                    <button className="row-delete" onClick={(e) => {
                      e.stopPropagation();
                      if(confirm('Delete?')) deleteDoc(doc(db, 'documents', docItem.id));
                    }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};