import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

import 'react-quill/dist/quill.snow.css';
import api from '../../api/axios'; 
import toast from 'react-hot-toast';
import { 
  Save, 
  Share2, 
  History, 
  Eye, 
  Users, 
  X, 
  Plus,
  Trash2,
  Clock,
  User
} from 'lucide-react';
// import ReactQuill from 'react-quill';


const DocumentEditor = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const quillRef = useRef();
  
  // Check if we're in edit mode from URL query parameter
  const isEditMode = new URLSearchParams(location.search).get('mode') === 'edit';
  
  const [document, setDocument] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState('private');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSharing, setShowSharing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [sharePermission, setSharePermission] = useState('view');
  const [versions, setVersions] = useState([]);
  const [isNewDocument, setIsNewDocument] = useState(false);

  // Auto-save timer
  const autoSaveTimer = useRef(null);

  useEffect(() => {
    // Robustly handle new document and invalid id
    if (!id || id === 'undefined' || id === 'new') {
      setIsNewDocument(true);
      setLoading(false);
    } else if (/^[a-f\d]{24}$/i.test(id)) { // Only fetch if id is a valid MongoDB ObjectId
      fetchDocument();
    } else {
      toast.error('Invalid document ID');
      navigate('/documents');
    }
  }, [id]);

  useEffect(() => {
    // Auto-save after 3 seconds of inactivity
    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current);
    }
    
    if (content && !isNewDocument) {
      autoSaveTimer.current = setTimeout(() => {
        autoSave();
      }, 3000);
    }

    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
    };
  }, [content]);

  const fetchDocument = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const response = await api.get(`/doc/get/${id}`, config);
      const doc = response.data;
      setDocument(doc);
      setTitle(doc.title);
      setContent(doc.content);
      setVisibility(doc.visibilityStatus);
    } catch (error) {
      toast.error('Failed to load document');
      navigate('/documents');
    } finally {
      setLoading(false);
    }
  };

  const fetchVersions = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const response = await api.get(`/doc/versions/${id}`, config);
      setVersions(response.data.versions);
    } catch (error) {
      toast.error('Failed to load version history');
    }
  };

  const saveDocument = async (isAutoSave = false) => {
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const documentData = {
        title,
        content,
        visibilityStatus: visibility,
        author: user._id
      };

      if (isNewDocument) {
        const response = await api.post('/doc/create', documentData, config);
        const newDoc = response.data.document;
        setIsNewDocument(false);
        navigate(`/document/${newDoc._id}`);
        toast.success('Document created successfully!');
      } else {
        await api.patch(`/doc/edit/${id}`, {
          title,
          content,
          visibilityStatus: visibility,
          userId: user._id
        }, config);
        
        if (!isAutoSave) {
          toast.success('Document saved successfully!');
          // Navigate back to document list if we came from edit mode
          if (isEditMode) {
            navigate('/documents');
          }
        }
      }
    } catch (error) {
      toast.error('Failed to save document');
    } finally {
      setSaving(false);
    }
  };

  const autoSave = () => {
    if (!isNewDocument && content) {
      saveDocument(true);
    }
  };

  const handleShare = async () => {
    if (!shareEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      await api.post(`/doc/share/${id}`, {
        email: shareEmail,
        permission: sharePermission
      }, config);

      toast.success('Document shared successfully!');
      setShareEmail('');
      setShowSharing(false);
    } catch (error) {
      toast.error('Failed to share document');
    }
  };

  const removeShare = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      await api.delete(`/doc/share/${id}/${userId}`, config);
      toast.success('User removed from sharing');
      fetchDocument(); // Refresh document data
    } catch (error) {
      toast.error('Failed to remove user');
    }
  };

  const handleMention = async (mentionedUserId) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      await api.post(`/doc/mention/${id}`, {
        mentionedUserId,
        byUserId: user._id
      }, config);

      toast.success('User mentioned and notified!');
    } catch (error) {
      toast.error('Failed to mention user');
    }
  };

  if (loading) {
    return (
      <div className="editor-container">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <div className="loading-spinner"></div>
          <p>Loading document...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="editor-container">
      <div className="editor-header">
        <div style={{ flex: 1 }}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Document title..."
            style={{
              fontSize: '24px',
              fontWeight: '700',
              border: 'none',
              outline: 'none',
              width: '100%',
              background: 'transparent',
              borderBottom: isEditMode ? '2px solid #667eea' : 'none',
              paddingBottom: isEditMode ? '4px' : '0'
            }}
          />
        </div>

        <div className="editor-controls">
          {isEditMode && (
            <button
              onClick={() => navigate('/documents')}
              className="btn btn-secondary"
              style={{ width: 'auto', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              ← Back to Documents
            </button>
          )}
          
          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value)}
            className="visibility-select"
          >
            <option value="private">Private</option>
            <option value="public">Public</option>
            <option value="restricted">Restricted</option>
          </select>

          <button
            onClick={() => setShowHistory(true)}
            className="btn btn-secondary"
            style={{ width: 'auto', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <History size={16} />
            History
          </button>

          <button
            onClick={() => setShowSharing(true)}
            className="btn btn-secondary"
            style={{ width: 'auto', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Share2 size={16} />
            Share
          </button>

          <button
            onClick={() => saveDocument()}
            className="btn btn-primary"
            disabled={saving}
            style={{ width: 'auto', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Save size={16} />
            {saving ? 'Saving...' : (isEditMode ? 'Save & Return' : 'Save')}
          </button>
        </div>
      </div>

      <div className="quill-editor">
        <div className="plain-editor">
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Start writing your document..."
            style={{
              width: '100%',
              minHeight: '300px',
              fontSize: '16px',
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid #e1e5e9',
              resize: 'vertical'
            }}
          />
        </div>
      </div>

      {/* Sharing Modal */}
      {showSharing && (
        <div className="sharing-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Share Document</h3>
              <button
                onClick={() => setShowSharing(false)}
                className="close-btn"
              >
                <X size={24} />
              </button>
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
                placeholder="Enter email address"
              />
            </div>

            <div className="form-group">
              <label>Permission</label>
              <select
                value={sharePermission}
                onChange={(e) => setSharePermission(e.target.value)}
                className="visibility-select"
              >
                <option value="view">View only</option>
                <option value="edit">Can edit</option>
              </select>
            </div>

            <button onClick={handleShare} className="btn btn-primary">
              Share Document
            </button>

            {document?.sharedWith && document.sharedWith.length > 0 && (
              <div className="shared-users">
                <h4 style={{ marginTop: '20px', marginBottom: '10px' }}>Currently Shared With:</h4>
                {document.sharedWith.map((share, index) => (
                  <div key={index} className="shared-user">
                    <div className="user-info">
                      <div className="user-avatar" style={{ width: '30px', height: '30px', fontSize: '12px' }}>
                        {share.user?.username?.charAt(0).toUpperCase()}
                      </div>
                      <span>{share.user?.username}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <select
                        value={share.permission}
                        onChange={(e) => {
                          // Handle permission change
                        }}
                        className="permission-select"
                      >
                        <option value="view">View</option>
                        <option value="edit">Edit</option>
                      </select>
                      <button
                        onClick={() => removeShare(share.user._id)}
                        className="remove-btn"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Version History Modal */}
      {showHistory && (
        <div className="sharing-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Version History</h3>
              <button
                onClick={() => setShowHistory(false)}
                className="close-btn"
              >
                <X size={24} />
              </button>
            </div>

            <div className="versions-container" style={{ padding: '0', boxShadow: 'none' }}>
              {versions.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
                  No version history available
                </p>
              ) : (
                versions.map((version, index) => (
                  <div key={index} className="version-item">
                    <div className="version-info">
                      <div>
                        <div className="version-date">
                          {new Date(version.modifiedAt).toLocaleString()}
                        </div>
                        <div className="version-author">
                          Modified by {version.modifiedBy?.username}
                        </div>
                      </div>
                    </div>
                    <button
                      className="btn btn-secondary"
                      style={{ width: 'auto', padding: '6px 12px', fontSize: '12px' }}
                      onClick={() => {
                        setContent(version.content);
                        setShowHistory(false);
                        toast.success('Version restored');
                      }}
                    >
                      <Eye size={12} style={{ marginRight: '4px' }} />
                      Restore
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentEditor; 