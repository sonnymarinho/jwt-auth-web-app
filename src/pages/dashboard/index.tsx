import { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';

export default function Dashboard() {
  const { user } = useAuth();

  useEffect(() => {
    api
      .get('/me')
      .then(response => console.info(response.data))
      .catch(error => console.error(error));
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      {user?.email && <p>Welcome {user?.email}</p>}
    </div>
  );
}
