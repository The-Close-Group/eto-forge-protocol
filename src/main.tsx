
import { createRoot } from 'react-dom/client'
import { ThirdwebProvider } from "thirdweb/react";
import { client, supportedChains } from './lib/thirdweb';
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(
  <ThirdwebProvider>
    <App />
  </ThirdwebProvider>
);
