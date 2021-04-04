import { useRouter } from 'next/router';
import { useEffect } from 'react';
import withAuth from '~/utils/withAuth';

const IndexPage = () => {
  const router = useRouter();

  useEffect(() => {
    router.push('/forestList');
  }, []);

  return <></>;
};

export default withAuth(IndexPage);
