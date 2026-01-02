import { Link } from 'react-router-dom';

interface Transaction {
  id: string;
  type: 'receive' | 'send' | 'reward';
  token: string;
  amount: number;
  time: string;
  status: 'pending' | 'confirmed' | 'failed';
  highlighted?: boolean;
  showChart?: boolean;
}

interface TransactionsCardProps {
  transactions: Transaction[];
  className?: string;
}

// Token icons as SVG components
const TokenIcons: Record<string, JSX.Element> = {
  BTC: (
    <svg viewBox="0 0 32 32" className="txn-token-svg">
      <circle cx="16" cy="16" r="16" fill="#F7931A"/>
      <path fill="#FFF" d="M22.5 14.1c.3-2-1.2-3.1-3.3-3.8l.7-2.7-1.6-.4-.7 2.6c-.4-.1-.9-.2-1.3-.3l.7-2.7-1.6-.4-.7 2.7c-.3-.1-.7-.2-1-.2l-2.2-.6-.5 1.7s1.2.3 1.2.3c.7.2.8.6.8 1l-1.9 7.7c-.1.2-.3.5-.8.4 0 0-1.2-.3-1.2-.3l-.8 1.9 2.1.5c.4.1.8.2 1.2.3l-.7 2.7 1.6.4.7-2.7c.4.1.9.2 1.3.3l-.7 2.7 1.6.4.7-2.7c2.9.5 5.1.3 6-2.3.7-2.1 0-3.3-1.6-4.1 1.1-.3 2-1.1 2.2-2.7zm-4 5.5c-.5 2.1-4.2 1-5.4.7l1-3.9c1.2.3 5 .9 4.4 3.2zm.6-5.6c-.5 1.9-3.5.9-4.5.7l.9-3.5c1 .3 4.1.7 3.6 2.8z"/>
    </svg>
  ),
  ETH: (
    <svg viewBox="0 0 32 32" className="txn-token-svg">
      <circle cx="16" cy="16" r="16" fill="#627EEA"/>
      <path fill="#FFF" fillOpacity=".6" d="M16.5 4v8.9l7.5 3.3z"/>
      <path fill="#FFF" d="M16.5 4L9 16.2l7.5-3.3z"/>
      <path fill="#FFF" fillOpacity=".6" d="M16.5 21.9v6.1l7.5-10.4z"/>
      <path fill="#FFF" d="M16.5 28v-6.1L9 17.6z"/>
      <path fill="#FFF" fillOpacity=".2" d="M16.5 20.6l7.5-4.4-7.5-3.3z"/>
      <path fill="#FFF" fillOpacity=".6" d="M9 16.2l7.5 4.4v-7.7z"/>
    </svg>
  ),
  SOL: (
    <svg viewBox="0 0 32 32" className="txn-token-svg">
      <circle cx="16" cy="16" r="16" fill="#000"/>
      <defs>
        <linearGradient id="solGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00FFA3"/>
          <stop offset="50%" stopColor="#03E1FF"/>
          <stop offset="100%" stopColor="#DC1FFF"/>
        </linearGradient>
      </defs>
      <path fill="url(#solGrad)" d="M10.5 20.2c.1-.1.2-.2.4-.2h10.5c.3 0 .4.3.2.5l-1.9 1.9c-.1.1-.2.2-.4.2H8.8c-.3 0-.4-.3-.2-.5l1.9-1.9zm0-8.4c.1-.1.2-.2.4-.2h10.5c.3 0 .4.3.2.5l-1.9 1.9c-.1.1-.2.2-.4.2H8.8c-.3 0-.4-.3-.2-.5l1.9-1.9zm10.9 4c-.1-.1-.2-.2-.4-.2H10.5c-.3 0-.4.3-.2.5l1.9 1.9c.1.1.2.2.4.2h10.5c.3 0 .4-.3.2-.5l-1.9-1.9z"/>
    </svg>
  ),
  MATIC: (
    <svg viewBox="0 0 32 32" className="txn-token-svg">
      <circle cx="16" cy="16" r="16" fill="#8247E5"/>
      <path fill="#FFF" d="M21.2 12.3c-.3-.2-.7-.2-1 0l-2.4 1.4-1.6.9-2.4 1.4c-.3.2-.7.2-1 0l-1.9-1.1c-.3-.2-.5-.5-.5-.9v-2.2c0-.4.2-.7.5-.9l1.9-1.1c.3-.2.7-.2 1 0l1.9 1.1c.3.2.5.5.5.9v1.4l1.6-.9v-1.5c0-.4-.2-.7-.5-.9l-3.4-2c-.3-.2-.7-.2-1 0l-3.5 2c-.3.2-.5.5-.5.9v4c0 .4.2.7.5.9l3.5 2c.3.2.7.2 1 0l2.4-1.4 1.6-.9 2.4-1.4c.3-.2.7-.2 1 0l1.9 1.1c.3.2.5.5.5.9v2.2c0 .4-.2.7-.5.9l-1.9 1.1c-.3.2-.7.2-1 0l-1.9-1.1c-.3-.2-.5-.5-.5-.9v-1.4l-1.6.9v1.5c0 .4.2.7.5.9l3.5 2c.3.2.7.2 1 0l3.5-2c.3-.2.5-.5.5-.9v-4c0-.4-.2-.7-.5-.9l-3.5-2z"/>
    </svg>
  ),
  USDT: (
    <svg viewBox="0 0 32 32" className="txn-token-svg">
      <circle cx="16" cy="16" r="16" fill="#26A17B"/>
      <path fill="#FFF" d="M17.9 17.9v0c-.1 0-.8 0-2 0s-1.8 0-2 0v0c-3.5.2-6.2.8-6.2 1.5s2.7 1.3 6.2 1.5v4.8h4v-4.8c3.5-.2 6.1-.8 6.1-1.5s-2.6-1.3-6.1-1.5zm0-2.5v-2.2h4.5V9.9H9.6v3.3h4.5v2.2c-4.2.2-7.3 1-7.3 1.9s3.1 1.7 7.3 1.9v6.9h3.8v-6.9c4.2-.2 7.3-1 7.3-1.9s-3.1-1.7-7.3-1.9z"/>
    </svg>
  ),
};

// Mini sparkline component
const MiniChart = ({ positive = true }: { positive?: boolean }) => {
  const color = positive ? '#CDFF00' : '#fff';
  const points = positive 
    ? "0,20 5,18 10,19 15,15 20,16 25,12 30,14 35,10 40,8 45,9 50,5"
    : "0,5 5,8 10,6 15,10 20,8 25,12 30,10 35,15 40,14 45,18 50,20";
  
  return (
    <svg className="txn-mini-chart" viewBox="0 0 50 25" preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export function TransactionsCard({ transactions, className = '' }: TransactionsCardProps) {
  const formatAmount = (amount: number) => {
    const sign = amount >= 0 ? '+' : '';
    const formatted = Math.abs(amount).toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: amount < 1 ? 6 : 2 
    });
    return `${sign}${amount >= 0 ? '' : '-'}${formatted}`;
  };

  return (
    <div className={`txn-card ${className}`}>
      {/* Header */}
      <div className="txn-header">
        <h3 className="txn-title">Transactions</h3>
        <Link to="/dashboard" className="txn-link">View All</Link>
      </div>
      
      {/* Grid */}
      <div className="txn-grid">
        {transactions.slice(0, 6).map((tx) => (
          <div 
            key={tx.id} 
            className={`txn-item ${tx.highlighted ? 'highlighted' : ''}`}
          >
            {/* Top Row: Icon + Type + Time */}
            <div className="txn-top">
              <div className="txn-icon-wrap">
                {TokenIcons[tx.token] || TokenIcons['ETH']}
              </div>
              <div className="txn-info">
                <span className="txn-type">{tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}</span>
                <span className="txn-time">{tx.time}</span>
              </div>
            </div>

            {/* Chart (optional) */}
            {tx.showChart && (
              <div className="txn-chart-area">
                <MiniChart positive={tx.amount >= 0} />
              </div>
            )}

            {/* Token + Amount */}
            <div className="txn-data">
              <span className="txn-symbol">{tx.token}</span>
              <span className={`txn-amount ${tx.amount >= 0 ? '' : 'negative'}`}>
                {formatAmount(tx.amount)}
              </span>
            </div>

            {/* Status */}
            <div className={`txn-status ${tx.status}`}>
              <span className="txn-dot" />
              <span>{tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TransactionsCard;
