import useAuthStore from '../stores/authStore';

function ProfilePage() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Profile</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account settings
        </p>
      </div>

      <div className="bg-card border rounded-lg p-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Username</label>
            <p className="text-lg font-medium">{user?.username || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Account Status</label>
            <p className="text-lg font-medium">Active</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-6">
          Profile management features will be implemented in the next phase.
        </p>
      </div>
    </div>
  );
}

export default ProfilePage;