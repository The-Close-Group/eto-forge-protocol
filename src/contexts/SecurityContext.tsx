import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { generateUUID } from '@/lib/utils';

interface SecurityEvent {
  id: string;
  userId: string;
  eventType: 'login' | 'logout' | 'trade' | 'transfer' | 'settings_change' | 'security_alert';
  description: string;
  metadata: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

interface SecurityAlert {
  id: string;
  type: 'suspicious_activity' | 'failed_login' | 'unusual_transaction' | 'security_breach';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
}

interface SecurityContextType {
  securityEvents: SecurityEvent[];
  securityAlerts: SecurityAlert[];
  isLoading: boolean;
  logSecurityEvent: (event: Omit<SecurityEvent, 'id' | 'userId' | 'timestamp'>) => Promise<void>;
  acknowledgeAlert: (alertId: string) => Promise<void>;
  getSecurityScore: () => number;
  refreshSecurityData: () => Promise<void>;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export function SecurityProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const logSecurityEvent = useCallback(async (event: Omit<SecurityEvent, 'id' | 'userId' | 'timestamp'>) => {
    if (!user?.id) return;

    try {
      const securityEvent: SecurityEvent = {
        ...event,
        id: generateUUID(),
        userId: user.id,
        timestamp: new Date(),
        ipAddress: await fetch('https://api.ipify.org?format=json').then(r => r.json()).then(d => d.ip).catch(() => 'unknown'),
        userAgent: navigator.userAgent
      };

      // Store in database
      await supabase.from('security_events').insert({
        user_id: securityEvent.userId,
        event_type: securityEvent.eventType,
        description: securityEvent.description,
        metadata: securityEvent.metadata,
        ip_address: securityEvent.ipAddress,
        user_agent: securityEvent.userAgent,
        risk_level: securityEvent.riskLevel
      });

      setSecurityEvents(prev => [securityEvent, ...prev.slice(0, 99)]); // Keep last 100 events

      // Check for suspicious patterns
      if (securityEvent.riskLevel === 'high' || securityEvent.riskLevel === 'critical') {
        const alert: SecurityAlert = {
          id: generateUUID(),
          type: 'suspicious_activity',
          message: `High-risk activity detected: ${securityEvent.description}`,
          timestamp: new Date(),
          acknowledged: false
        };
        setSecurityAlerts(prev => [alert, ...prev]);
      }
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }, [user?.id]);

  const acknowledgeAlert = useCallback(async (alertId: string) => {
    try {
      await supabase.from('security_alerts').update({ acknowledged: true }).eq('id', alertId);
      setSecurityAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      ));
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
    }
  }, []);

  const getSecurityScore = useCallback(() => {
    if (securityEvents.length === 0) return 100;

    const recentEvents = securityEvents.filter(event => 
      Date.now() - event.timestamp.getTime() < 24 * 60 * 60 * 1000 // Last 24 hours
    );

    const riskScores = { low: 1, medium: 3, high: 7, critical: 15 };
    const totalRisk = recentEvents.reduce((sum, event) => sum + riskScores[event.riskLevel], 0);
    
    return Math.max(0, 100 - totalRisk);
  }, [securityEvents]);

  const refreshSecurityData = useCallback(async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      // Fetch recent security events
      const { data: events } = await supabase
        .from('security_events')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (events) {
        const formattedEvents = events.map(event => ({
          id: event.id,
          userId: event.user_id,
          eventType: event.event_type as SecurityEvent['eventType'],
          description: event.description,
          metadata: (event.metadata as Record<string, any>) || {},
          ipAddress: event.ip_address,
          userAgent: event.user_agent,
          timestamp: new Date(event.created_at),
          riskLevel: event.risk_level as SecurityEvent['riskLevel']
        }));
        setSecurityEvents(formattedEvents);
      }

      // Fetch unacknowledged alerts
      const { data: alerts } = await supabase
        .from('security_alerts')
        .select('*')
        .eq('user_id', user.id)
        .eq('acknowledged', false)
        .order('created_at', { ascending: false });

      if (alerts) {
        const formattedAlerts = alerts.map(alert => ({
          id: alert.id,
          type: alert.alert_type as SecurityAlert['type'],
          message: alert.message,
          timestamp: new Date(alert.created_at),
          acknowledged: alert.acknowledged
        }));
        setSecurityAlerts(formattedAlerts);
      }
    } catch (error) {
      console.error('Failed to refresh security data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      refreshSecurityData();
    }
  }, [user?.id, refreshSecurityData]);

  const value: SecurityContextType = {
    securityEvents,
    securityAlerts,
    isLoading,
    logSecurityEvent,
    acknowledgeAlert,
    getSecurityScore,
    refreshSecurityData
  };

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
}

export function useSecurity() {
  const context = useContext(SecurityContext);
  if (context === undefined) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
}