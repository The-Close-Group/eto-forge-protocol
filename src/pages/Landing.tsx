import { useEffect } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const account = useActiveAccount();
  const navigate = useNavigate();

  // If user is already connected, redirect to dashboard
  useEffect(() => {
    if (account) {
      navigate('/dashboard', { replace: true });
    }
  }, [account, navigate]);

  // Full-screen iframe to the landing page
  return (
    <iframe
      src="/landing/index.html"
      title="ETO Landing"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        border: 'none',
        zIndex: 9999,
      }}
    />
  );
}
