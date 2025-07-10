import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { FileText, Plus, Clock, Users, Eye, Search } from 'lucide-react';

const Dashboard = ({ user }) => {
  const [stats, setStats] = useState({
    totalDocuments: 0,
    sharedDocuments: 0,
    recentDocuments: []
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredRecentDocs, setFilteredRecentDocs] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = stats.recentDocuments.filter(doc => {
        const title = doc.title || '';
        const content = doc.content || '';
        const searchLower = searchTerm.toLowerCase();
        
        return title.toLowerCase().includes(searchLower) ||
               content.toLowerCase().includes(searchLower);
      });
      setFilteredRecentDocs(filtered);
    } else {
      setFilteredRecentDocs(stats.recentDocuments);
    }
  }, [searchTerm, stats.recentDocuments]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      // Fetch user's documents
      const documentsResponse = await api.get(`/doc/list?userId=${user._id}`, config);
      const documents = documentsResponse.data;

      // Calculate shared documents from the documents list
      const sharedDocs = documents.filter(doc => 
        doc.sharedWith && doc.sharedWith.length > 0 && 
        doc.author._id !== user._id
      );

      setStats({
        totalDocuments: documents.length,
        sharedDocuments: sharedDocs.length,
        recentDocuments: documents.slice(0, 5) // Show last 5 documents
      });
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <div className="loading-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard" style={{ width: '100%', maxWidth: '100%', margin: 0, boxSizing: 'border-box' }}>
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Welcome back, {user?.username || 'User'}!</h1>
          <p style={{ color: '#666', marginTop: '5px' }}>
            Here's what's happening with your documents
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Link to="/change-password" className="btn btn-outline-secondary" style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
            Change Password
          </Link>
          <Link to="/document/new" className="btn btn-primary" style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={16} />
            New Document
          </Link>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{stats.totalDocuments}</div>
          <div className="stat-label">Total Documents</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.sharedDocuments}</div>
          <div className="stat-label">Shared Documents</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.recentDocuments.length}</div>
          <div className="stat-label">Recent Documents</div>
        </div>
      </div>

      <div style={{ marginTop: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#333' }}>
            Recent Documents
            {searchTerm && (
              <span style={{ fontSize: '14px', fontWeight: '400', color: '#666', marginLeft: '10px' }}>
                ({filteredRecentDocs.length} found)
              </span>
            )}
          </h2>
          <Link to="/documents" style={{ color: '#667eea', textDecoration: 'none', fontWeight: '500' }}>
            View all documents
          </Link>
        </div>

        {/* Search bar for recent documents */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ 
            display: 'flex', 
            gap: '10px', 
            maxWidth: '400px',
            background: '#fff',
            borderRadius: '8px',
            border: '1px solid #e1e5e9',
            padding: '8px 12px'
          }}>
            <Search size={16} style={{ color: '#999' }} />
            <input
              type="text"
              placeholder="Search recent documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                flex: 1,
                fontSize: '14px',
                background: 'transparent'
              }}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#999',
                  fontSize: '12px'
                }}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {filteredRecentDocs.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px', 
            background: '#f8f9fa', 
            borderRadius: '15px',
            border: '2px dashed #e1e5e9'
          }}>
            <FileText size={48} style={{ color: '#ccc', marginBottom: '15px' }} />
                      <h3 style={{ color: '#666', marginBottom: '10px' }}>
            {searchTerm ? `No documents found for "${searchTerm}"` : 'No documents yet'}
          </h3>
          <p style={{ color: '#999', marginBottom: '20px' }}>
            {searchTerm 
              ? 'Try different keywords or check your spelling' 
              : 'Create your first document to get started'
            }
          </p>
            <Link to="/document/new" className="btn btn-primary" style={{ width: 'auto' }}>
              <Plus size={16} style={{ marginRight: '8px' }} />
              Create Document
            </Link>
          </div>
        ) : (
          <div className="documents-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
            {filteredRecentDocs.map((doc) => (
              <div key={doc._id} className="document-card">
                <div className="document-title">{doc.title}</div>
                <div className="document-meta">
                                  <div className="document-author">
                  <div className="author-avatar">
                    {(doc.author?.username || 'U').charAt(0).toUpperCase()}
                  </div>
                  <span>{doc.author?.username || 'Unknown User'}</span>
                </div>
                  <span className={`visibility-badge visibility-${doc.visibilityStatus || 'private'}`}>
                    {doc.visibilityStatus || 'private'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#999' }}>
                    <Clock size={12} style={{ marginRight: '4px' }} />
                    {doc.lastModified ? new Date(doc.lastModified).toLocaleDateString() : 'No date'}
                  </span>
                  <Link 
                    to={`/document/${doc._id}`}
                    className="btn btn-secondary"
                  style={{ 
                      width: 'auto', 
                      padding: '6px 12px', 
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Eye size={12} />
                    Open
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 