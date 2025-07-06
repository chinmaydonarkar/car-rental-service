import { useState, useEffect } from 'react';
import type { User, CreateUserRequest } from '../types';
import { apiService } from '../services/api';
import './UserManagement.css';

function UserManagementComponent() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<CreateUserRequest>({
    name: '',
    email: '',
    password: '',
    licenseNumber: '',
    licenseValidUntil: ''
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const userData = await apiService.getUsers();
      setUsers(userData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await apiService.createUser(formData);
      setFormData({
        name: '',
        email: '',
        password: '',
        licenseNumber: '',
        licenseValidUntil: ''
      });
      setShowForm(false);
      loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const isLicenseValid = (validUntil: string) => {
    return new Date(validUntil) > new Date();
  };

  return (
    <div className="user-management">
      <h2>👥 User Management</h2>
      
      <div className="header-section">
        <h3>Manage Users</h3>
        <button 
          className="add-button"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '❌ Cancel' : '➕ Add New User'}
        </button>
      </div>

      {showForm && (
        <form className="user-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Full Name:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="Enter full name"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="Enter email address"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password:</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                placeholder="Enter password"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="licenseNumber">License Number:</label>
              <input
                type="text"
                id="licenseNumber"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleInputChange}
                required
                placeholder="Enter license number"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="licenseValidUntil">License Valid Until:</label>
              <input
                type="date"
                id="licenseValidUntil"
                name="licenseValidUntil"
                value={formData.licenseValidUntil}
                onChange={handleInputChange}
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? '⏳ Creating...' : '✅ Create User'}
          </button>
        </form>
      )}

      {error && <div className="error">⚠️ {error}</div>}

      <div className="users-list">
        <h3>📋 Registered Users</h3>
        {loading ? (
          <p>🔄 Loading users...</p>
        ) : users.length > 0 ? (
          <div className="users-grid">
            {users.map((user) => (
              <div key={user._id} className="user-card">
                <h4>👤 {user.name}</h4>
                <div className="user-details">
                  <p>
                    <strong>📧 Email:</strong>
                    <span>{user.email}</span>
                  </p>
                  <p>
                    <strong>🚗 License:</strong>
                    <span>{user.licenseNumber}</span>
                  </p>
                  <p>
                    <strong>📅 Valid Until:</strong>
                    <span className={isLicenseValid(user.licenseValidUntil) ? 'license-valid' : 'license-expired'}>
                      {isLicenseValid(user.licenseValidUntil) ? '✅ ' : '❌ '}
                      {new Date(user.licenseValidUntil).toLocaleDateString()}
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>📭 No users found. Add your first user above!</p>
        )}
      </div>
    </div>
  );
}

export default UserManagementComponent; 