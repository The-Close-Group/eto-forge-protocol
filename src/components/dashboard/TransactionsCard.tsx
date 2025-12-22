import { Link } from 'react-router-dom';
import { ArrowDownLeft, ArrowUpRight, Gift, ExternalLink, Clock, CheckCircle2, XCircle, ChevronRight } from 'lucide-react';
import maangLogo from '@/assets/maang-logo.svg';

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

// Token configs with colors matching MAANG design language
const TokenConfigs: Record<string, { color: string; logo?: string }> = {
  MAANG: { color: '#10b981' },
  sMAANG: { color: '#8b5cf6' },
  USDC: { color: '#2775ca' },
  BTC: { color: '#F7931A' },
  ETH: { color: '#627EEA' },
  SOL: { color: '#9945FF' },
};

// Token icon component using MAANG style
const TokenIcon = ({ token }: { token: string }) => {
  const config = TokenConfigs[token] || { color: '#666' };
  const isMaangStyle = token === 'MAANG' || token === 'sMAANG';
  
  return (
    <div 
      className="txn-token-icon"
      style={{ background: `${config.color}15` }}
    >
      {isMaangStyle ? (
        <img src={maangLogo} alt={token} className="txn-token-img" />
      ) : token === 'USDC' ? (
        <img 
          src="https://cryptologos.cc/logos/usd-coin-usdc-logo.svg?v=040" 
          alt="USDC" 
          className="txn-token-img" 
        />
      ) : (
        <span className="txn-token-letter" style={{ color: config.color }}>
          {token.charAt(0)}
        </span>
      )}
    </div>
  );
};

// Mini sparkline component with design language colors
const MiniChart = ({ positive = true }: { positive?: boolean }) => {
  // Use primary green for positive, muted for negative
  const color = positive ? 'hsl(160, 70%, 50%)' : 'hsl(var(--muted-foreground))';
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
        opacity={positive ? 1 : 0.5}
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

  const getTypeIcon = (type: string, amount: number) => {
    switch (type) {
      case 'receive':
        return <ArrowDownLeft className="w-3.5 h-3.5" />;
      case 'send':
        return <ArrowUpRight className="w-3.5 h-3.5" />;
      case 'reward':
        return <Gift className="w-3.5 h-3.5" />;
      default:
        return null;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle2 className="w-3 h-3" />;
      case 'pending':
        return <Clock className="w-3 h-3" />;
      case 'failed':
        return <XCircle className="w-3 h-3" />;
      default:
        return null;
    }
  };

  return (
    <div className={`txn-card ${className}`}>
      {/* Header */}
      <div className="txn-header">
        <div className="txn-header-left">
          <h3 className="txn-title">Recent Transactions</h3>
          <span className="txn-count">{transactions.length} total</span>
        </div>
        <Link to="/dashboard" className="txn-link">
          View All
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      
      {/* Grid - MAANG Design Language */}
      <div className="txn-grid">
        {transactions.slice(0, 6).map((tx) => (
          <div 
            key={tx.id} 
            className={`txn-item group ${tx.highlighted ? 'highlighted' : ''}`}
          >
            {/* Quick action on hover */}
            <div className="txn-quick-action">
              <ExternalLink className="w-3 h-3" />
            </div>

            {/* Top Row: Icon + Type + Time */}
            <div className="txn-top">
              <div className={`txn-type-icon ${tx.type}`}>
                {getTypeIcon(tx.type, tx.amount)}
              </div>
              <TokenIcon token={tx.token} />
              <div className="txn-info">
                <span className="txn-type-label">{tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}</span>
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
              <span className={`txn-amount ${tx.amount >= 0 ? 'positive' : 'negative'}`}>
                {formatAmount(tx.amount)}
              </span>
            </div>

            {/* Status */}
            <div className={`txn-status ${tx.status}`}>
              {getStatusIcon(tx.status)}
              <span>{tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TransactionsCard;
