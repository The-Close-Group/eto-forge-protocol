
import { createRoot } from 'react-dom/client'
import { ThirdwebProvider } from "thirdweb/react";
import { client } from './lib/thirdweb';
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(
  <ThirdwebProvider client={client}>
    <App />
  </ThirdwebProvider>
);
