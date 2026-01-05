import { supabase } from '@/integrations/supabase/client';
import { generateUUID } from '@/lib/utils';

export interface AuditLogEntry {
  action: string;
  resource: string;
  resourceId?: string;
  userId: string;
  details: Record<string, unknown>;
  metadata: {
    ipAddress?: string;
    userAgent?: string;
    timestamp: Date;
    sessionId?: string;
  };
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

class AuditLogger {
  private sessionId: string;

  constructor() {
    this.sessionId = generateUUID();
  }

  async log(entry: Omit<AuditLogEntry, 'metadata'> & { metadata?: Partial<AuditLogEntry['metadata']> }) {
    try {
      const ipAddress = await this.getClientIP().catch(() => 'unknown');
      
      const auditEntry: AuditLogEntry = {
        ...entry,
        metadata: {
          ipAddress,
          userAgent: navigator.userAgent,
          timestamp: new Date(),
          sessionId: this.sessionId,
          ...entry.metadata
        }
      };

      // Store in security_events table
      await supabase.from('security_events').insert({
        user_id: auditEntry.userId,
        event_type: this.mapActionToEventType(auditEntry.action),
        description: `${auditEntry.action} on ${auditEntry.resource}${auditEntry.resourceId ? ` (${auditEntry.resourceId})` : ''}`,
        metadata: JSON.stringify({
          ...auditEntry.details,
          ...auditEntry.metadata,
          action: auditEntry.action,
          resource: auditEntry.resource,
          resourceId: auditEntry.resourceId
        }),
        ip_address: auditEntry.metadata.ipAddress,
        user_agent: auditEntry.metadata.userAgent,
        risk_level: auditEntry.riskLevel
      });

      // Log to console for development
      if (process.env.NODE_ENV === 'development') {
        console.log('Audit Log:', auditEntry);
      }

      // Check for high-risk events and create alerts
      if (auditEntry.riskLevel === 'high' || auditEntry.riskLevel === 'critical') {
        await this.createSecurityAlert(auditEntry);
      }

    } catch (error) {
      console.error('Failed to log audit entry:', error);
      // In production, you might want to send this to an external logging service
    }
  }

  private async getClientIP(): Promise<string> {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  }

  private mapActionToEventType(action: string): string {
    const mapping: Record<string, string> = {
      'login': 'login',
      'logout': 'logout',
      'trade_execute': 'trade',
      'trade_cancel': 'trade',
      'transfer_initiate': 'transfer',
      'transfer_complete': 'transfer',
      'settings_update': 'settings_change',
      'security_incident': 'security_alert'
    };

    return mapping[action] || 'security_alert';
  }

  private async createSecurityAlert(entry: AuditLogEntry) {
    try {
      await supabase.from('security_alerts').insert({
        user_id: entry.userId,
        alert_type: this.determineAlertType(entry),
        message: `High-risk activity detected: ${entry.action} on ${entry.resource}`,
        acknowledged: false
      });
    } catch (error) {
      console.error('Failed to create security alert:', error);
    }
  }

  private determineAlertType(entry: AuditLogEntry): string {
    if (entry.action.includes('login') && entry.riskLevel === 'critical') {
      return 'failed_login';
    }
    if (entry.action.includes('trade') && entry.riskLevel === 'high') {
      return 'unusual_transaction';
    }
    if (entry.riskLevel === 'critical') {
      return 'security_breach';
    }
    return 'suspicious_activity';
  }

  // Predefined logging methods for common actions
  async logLogin(userId: string, success: boolean, details: Record<string, unknown> = {}) {
    await this.log({
      action: success ? 'login' : 'login_failed',
      resource: 'auth',
      userId,
      details: { success, ...details },
      riskLevel: success ? 'low' : 'medium'
    });
  }

  async logTrade(userId: string, tradeDetails: Record<string, unknown>) {
    const riskLevel = this.assessTradeRisk(tradeDetails);
    await this.log({
      action: 'trade_execute',
      resource: 'trade',
      resourceId: tradeDetails.tradeId,
      userId,
      details: tradeDetails,
      riskLevel
    });
  }

  async logTransfer(userId: string, transferDetails: Record<string, unknown>) {
    const riskLevel = this.assessTransferRisk(transferDetails);
    await this.log({
      action: 'transfer_initiate',
      resource: 'transfer',
      resourceId: transferDetails.transferId,
      userId,
      details: transferDetails,
      riskLevel
    });
  }

  async logSettingsChange(userId: string, settingType: string, details: Record<string, unknown> = {}) {
    const riskLevel = settingType.includes('security') ? 'medium' : 'low';
    await this.log({
      action: 'settings_update',
      resource: 'user_settings',
      userId,
      details: { settingType, ...details },
      riskLevel
    });
  }

  private assessTradeRisk(tradeDetails: Record<string, unknown>): 'low' | 'medium' | 'high' | 'critical' {
    const amount = typeof tradeDetails.amount === 'number' ? tradeDetails.amount : 0;
    const asset = typeof tradeDetails.asset === 'string' ? tradeDetails.asset : '';
    const orderType = typeof tradeDetails.orderType === 'string' ? tradeDetails.orderType : '';
    
    // High value trades are higher risk
    if (amount > 100000) return 'high';
    if (amount > 10000) return 'medium';
    
    // Complex order types are medium risk
    if (['stop_loss', 'trailing_stop', 'bracket'].includes(orderType)) {
      return 'medium';
    }
    
    return 'low';
  }

  private assessTransferRisk(transferDetails: Record<string, unknown>): 'low' | 'medium' | 'high' | 'critical' {
    const amount = typeof transferDetails.amount === 'number' ? transferDetails.amount : 0;
    const destination = typeof transferDetails.destination === 'string' ? transferDetails.destination : '';
    const isExternal = typeof transferDetails.isExternal === 'boolean' ? transferDetails.isExternal : false;
    
    // External transfers are higher risk
    if (isExternal && amount > 50000) return 'critical';
    if (isExternal && amount > 10000) return 'high';
    if (isExternal) return 'medium';
    
    // Large internal transfers
    if (amount > 100000) return 'medium';
    
    return 'low';
  }
}

export const auditLogger = new AuditLogger();