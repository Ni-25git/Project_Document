import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Search, Plus, Eye, Edit, Share2, Clock, Users } from 'lucide-react';

const DocumentList = ({ user }) => {
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, my, shared

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    filterDocuments();
  }, [documents, searchTerm, filter]);

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const response = await api.get(`/doc/list?userId=${user._id}`, config);
      // Ensure we have valid data
      const documents = Array.isArray(response.data) ? response.data : [];
      setDocuments(documents);
    } catch (error) {
      console.error('Failed to load documents:', error);
      toast.error('Failed to load documents');
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const filterDocuments = () => {
    try {
      let filtered = documents || [];

      // Apply filter
      if (filter === 'my') {
        filtered = filtered.filter(doc => doc?.author?._id === user._id);
      } else if (filter === 'shared') {
        filtered = filtered.filter(doc => doc?.author?._id !== user._id);
      }

      // Apply search
      if (searchTerm) {
        filtered = filtered.filter(doc => {
          const title = doc?.title || '';
          const content = doc?.content || '';
          const searchLower = searchTerm.toLowerCase();
          
          return title.toLowerCase().includes(searchLower) ||
                 content.toLowerCase().includes(searchLower);
        });
      }

      setFilteredDocuments(filtered);
    } catch (error) {
      console.error('Error filtering documents:', error);
      setFilteredDocuments([]);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchDocuments();
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const response = await api.get(`/doc/search?q=${encodeURIComponent(searchTerm)}`, config);
      const searchResults = response.data;
      
      // Filter search results based on current filter
      let filteredResults = searchResults;
      if (filter === 'my') {
        filteredResults = searchResults.filter(doc => doc.author._id === user._id);
      } else if (filter === 'shared') {
        filteredResults = searchResults.filter(doc => 
          doc.sharedWith && doc.sharedWith.some(share => share.user === user._id)
        );
      }
      
      setDocuments(filteredResults);
      
      if (filteredResults.length === 0) {
        toast.error(`No documents found matching "${searchTerm}"`);
      } else {
        toast.success(`Found ${filteredResults.length} document(s) matching "${searchTerm}"`);
      }
    } catch (error) {
      toast.error('Search failed');
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getVisibilityColor = (status) => {
    switch (status) {
      case 'public': return '#28a745';
      case 'private': return '#dc3545';
      case 'restricted': return '#ffc107';
      default: return '#6c757d';
    }
  };

  if (loading) {
    return (
      <div className="documents-container">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <div className="loading-spinner"></div>
          <p>Loading documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="documents-container">
      <div className="documents-header">
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#333', marginBottom: '5px' }}>
            Documents
          </h1>
          <p style={{ color: '#666' }}>
            Manage and organize your documents
          </p>
        </div>
        <Link to="/document/new" className="btn btn-primary" style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={16} />
          New Document
        </Link>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search documents by title or content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button
            onClick={handleSearch}
            className="btn btn-primary"
            style={{ width: 'auto', padding: '10px 16px' }}
            disabled={loading}
          >
            <Search size={16} />
            {loading ? 'Searching...' : 'Search'}
          </button>
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm('');
                fetchDocuments();
              }}
              className="btn btn-secondary"
              style={{ width: 'auto', padding: '10px 16px' }}
            >
              Clear
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
          <button
            onClick={() => setFilter('all')}
            className={`btn btn-secondary ${filter === 'all' ? 'active' : ''}`}
            style={{ width: 'auto', padding: '8px 16px' }}
          >
            All Documents
          </button>
          <button
            onClick={() => setFilter('my')}
            className={`btn btn-secondary ${filter === 'my' ? 'active' : ''}`}
            style={{ width: 'auto', padding: '8px 16px' }}
          >
            My Documents
          </button>
          <button
            onClick={() => setFilter('shared')}
            className={`btn btn-secondary ${filter === 'shared' ? 'active' : ''}`}
            style={{ width: 'auto', padding: '8px 16px' }}
          >
            Shared with Me
          </button>
        </div>
      </div>

      {filteredDocuments.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px', 
          background: '#f8f9fa', 
          borderRadius: '15px',
          border: '2px dashed #e1e5e9'
        }}>
          <Search size={48} style={{ color: '#ccc', marginBottom: '15px' }} />
          <h3 style={{ color: '#666', marginBottom: '10px' }}>
            {searchTerm ? `No documents found for "${searchTerm}"` : 'No documents yet'}
          </h3>
          <p style={{ color: '#999', marginBottom: '20px' }}>
            {searchTerm 
              ? 'Try different keywords or check your spelling' 
              : 'Create your first document to get started'
            }
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  fetchDocuments();
                }}
                className="btn btn-secondary"
                style={{ width: 'auto' }}
              >
                Clear Search
              </button>
            )}
            {!searchTerm && (
              <Link to="/document/new" className="btn btn-primary" style={{ width: 'auto' }}>
                <Plus size={16} style={{ marginRight: '8px' }} />
                Create Document
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="documents-grid">
          {filteredDocuments.map((doc) => (
            <div key={doc._id} className="document-card">
              <div className="document-title">{doc.title}</div>
              
              <div className="document-meta">
                <div className="document-author">
                  <div className="author-avatar">
                    {(doc.author?.username || 'U').charAt(0).toUpperCase()}
                  </div>
                  <span>{doc.author?.username || 'Unknown User'}</span>
                </div>
                <span 
                  className={`visibility-badge visibility-${doc.visibilityStatus || 'private'}`}
                  style={{ backgroundColor: getVisibilityColor(doc.visibilityStatus || 'private') + '20', color: getVisibilityColor(doc.visibilityStatus || 'private') }}
                >
                  {doc.visibilityStatus || 'private'}
                </span>
              </div>

              <div style={{ 
                fontSize: '14px', 
                color: '#666', 
                marginBottom: '15px',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {(doc?.content || '').substring(0, 100)}...
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <span style={{ fontSize: '12px', color: '#999', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={12} />
                  {doc.lastModified ? new Date(doc.lastModified).toLocaleDateString() : 'No date'}
                </span>
                {doc.sharedWith && doc.sharedWith.length > 0 && (
                  <span style={{ fontSize: '12px', color: '#999', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Users size={12} />
                    {doc.sharedWith.length} shared
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <Link 
                  to={`/document/${doc._id}`}
                  className="btn btn-primary"
                  style={{ 
                    flex: 1, 
                    padding: '8px 12px', 
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                >
                  <Eye size={12} />
                  Open
                </Link>
                {doc.author?._id === user._id && (
                  <Link 
                    to={`/document/${doc._id}?mode=edit`}
                    className="btn btn-secondary"
                    style={{ 
                      width: 'auto', 
                      padding: '8px 12px', 
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Edit size={12} />
                    Edit
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentList; 