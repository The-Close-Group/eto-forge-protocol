interface PortfolioRiskScoreProps {
  riskLevel: number; // 0-100
  lastUpdated?: string;
  className?: string;
}

export function PortfolioRiskScore({
  riskLevel = 35,
  lastUpdated = 'Just Now',
  className = '',
}: PortfolioRiskScoreProps) {
  // Clamp risk level between 0 and 100
  const normalizedRisk = Math.max(0, Math.min(100, riskLevel));
  
  return (
    <div className={`risk-score-card ${className}`}>
      <div className="risk-score-header">
        <div>
          <h3 className="risk-score-title">Portfolio</h3>
          <h3 className="risk-score-title">Risk Score</h3>
        </div>
        <div className="risk-score-updated">
          <span className="updated-label">Updated:</span>
          <span className="updated-time">{lastUpdated}</span>
        </div>
      </div>
      
      <div className="risk-score-bar-container">
        <div className="risk-score-bar">
          <div 
            className="risk-score-indicator"
            style={{ left: `${normalizedRisk}%` }}
          />
        </div>
        <div className="risk-score-labels">
          <span>Low Risk</span>
          <span>High Risk</span>
        </div>
      </div>
    </div>
  );
}

export default PortfolioRiskScore;


