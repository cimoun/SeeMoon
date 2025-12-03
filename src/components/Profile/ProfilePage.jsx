import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { User, Mail, Calendar, Save, Lock, Trash2, CheckCircle, FileText, Target } from 'lucide-react';
import { api } from '../../api/client';
import { useAuthStore } from '../../stores/authStore';
import { Button, Input, TextArea, Card, CardTitle, Modal } from '../UI';

export function ProfilePage() {
  const { user, updateUser, logout } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    bio: '',
  });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const [deletePassword, setDeletePassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await api.getProfile();
      setProfile(data);
      setFormData({
        username: data.username || '',
        bio: data.bio || '',
      });
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const updated = await api.updateProfile(formData);
      setProfile({ ...profile, ...updated });
      updateUser(updated);
      setSuccess('Profile updated successfully');
    } catch (error) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setError('');

    if (passwordForm.new !== passwordForm.confirm) {
      setError('Passwords do not match');
      return;
    }

    if (passwordForm.new.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      await api.changePassword(passwordForm.current, passwordForm.new);
      setShowPasswordModal(false);
      setPasswordForm({ current: '', new: '', confirm: '' });
      setSuccess('Password changed successfully');
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await api.deleteAccount(deletePassword);
      logout();
    } catch (error) {
      setError(error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-moon-100">Profile</h1>
        <p className="text-moon-400 mt-1">Manage your account settings</p>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-900/50 border border-red-700 text-red-300">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 rounded-lg bg-green-900/50 border border-green-700 text-green-300">
          {success}
        </div>
      )}

      {/* Profile Card */}
      <Card>
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white">
            {profile?.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 space-y-4">
            <Input
              label="Username"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              icon={User}
            />

            <div className="flex items-center gap-2 text-moon-400">
              <Mail className="w-4 h-4" />
              <span>{profile?.email}</span>
            </div>

            <TextArea
              label="Bio"
              placeholder="Tell us about yourself..."
              value={formData.bio}
              onChange={(e) =>
                setFormData({ ...formData, bio: e.target.value })
              }
              className="min-h-[100px]"
            />

            <div className="flex items-center gap-2 text-sm text-moon-500">
              <Calendar className="w-4 h-4" />
              <span>
                Member since{' '}
                {profile?.created_at
                  ? format(new Date(profile.created_at), 'MMMM d, yyyy')
                  : 'Unknown'}
              </span>
            </div>

            <Button onClick={handleSave} loading={saving} icon={Save}>
              Save Changes
            </Button>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="text-center">
          <CheckCircle className="w-8 h-8 text-primary-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-moon-100">
            {profile?.stats?.completed_tasks || 0}
          </p>
          <p className="text-sm text-moon-400">Tasks Completed</p>
        </Card>

        <Card className="text-center">
          <FileText className="w-8 h-8 text-green-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-moon-100">
            {profile?.stats?.notes_count || 0}
          </p>
          <p className="text-sm text-moon-400">Notes Created</p>
        </Card>

        <Card className="text-center">
          <Target className="w-8 h-8 text-purple-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-moon-100">
            {profile?.stats?.habits_count || 0}
          </p>
          <p className="text-sm text-moon-400">Active Habits</p>
        </Card>
      </div>

      {/* Security */}
      <Card>
        <CardTitle className="mb-4">Security</CardTitle>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-moon-100">Change Password</p>
              <p className="text-sm text-moon-400">
                Update your password regularly for security
              </p>
            </div>
            <Button
              variant="secondary"
              icon={Lock}
              onClick={() => setShowPasswordModal(true)}
            >
              Change
            </Button>
          </div>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-900/50">
        <CardTitle className="mb-4 text-red-400">Danger Zone</CardTitle>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-moon-100">Delete Account</p>
            <p className="text-sm text-moon-400">
              Permanently delete your account and all data
            </p>
          </div>
          <Button
            variant="danger"
            icon={Trash2}
            onClick={() => setShowDeleteModal(true)}
          >
            Delete
          </Button>
        </div>
      </Card>

      {/* Change Password Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Change Password"
      >
        <div className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            value={passwordForm.current}
            onChange={(e) =>
              setPasswordForm({ ...passwordForm, current: e.target.value })
            }
          />
          <Input
            label="New Password"
            type="password"
            value={passwordForm.new}
            onChange={(e) =>
              setPasswordForm({ ...passwordForm, new: e.target.value })
            }
          />
          <Input
            label="Confirm New Password"
            type="password"
            value={passwordForm.confirm}
            onChange={(e) =>
              setPasswordForm({ ...passwordForm, confirm: e.target.value })
            }
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => setShowPasswordModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleChangePassword}>Change Password</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Account Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Account"
      >
        <div className="space-y-4">
          <p className="text-moon-300">
            This action cannot be undone. All your data will be permanently
            deleted.
          </p>
          <Input
            label="Enter your password to confirm"
            type="password"
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteAccount}>
              Delete Account
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
