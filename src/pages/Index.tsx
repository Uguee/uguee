
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Landing from './Landing';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // You could redirect to the landing page if needed
    // navigate('/');
  }, [navigate]);

  // Just render the Landing page directly
  return <Landing />;
};

export default Index;
