import type { GetServerSideProps, NextPage } from 'next';
import { withSSRGuest } from '../utils/withSSRGuest';
import Signin from './signin';

const Home: NextPage = () => <Signin />;

export default Home;

export const getServerSideProps: GetServerSideProps = withSSRGuest(async ctx => {
  return {
    props: {},
  };
});
