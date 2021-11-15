import { useAuth } from '../../contexts/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div>
      <h1>Dashboard</h1>
      {user?.email && <p>Welcome {user?.email}</p>}
    </div>
  );
}
