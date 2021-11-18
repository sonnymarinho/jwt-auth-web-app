import { GetServerSideProps } from 'next';
import { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { setupAPIClient } from '../../services/api/setup';
import { withSSRAuth } from '../../utils/withSSRAuth';

export default function Dashboard() {
  const { user } = useAuth();

  useEffect(() => {
    api.get('/me').then(response => console.log('dashboard', response.data));
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      {user?.email && <p>Welcome {user?.email}</p>}
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = withSSRAuth(async ctx => {
  const apiClient = setupAPIClient(ctx);
  const response = await apiClient.get('/me');

  console.log('dashboard', response.data);

  return {
    props: {},
  };
});
