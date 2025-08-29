import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Users, Shield, TrendingUp, Activity, Eye, UserCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import SEO from '@/components/SEO';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  securityAlerts: number;
  recentRegistrations: number;
  avgRiskScore: number;
  complianceRate: number;
}

interface SecurityAlert {
  id: string;
  userId: string;
  type: string;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
}

interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  verificationStatus: string;
  kycLevel: number;
  riskScore: number;
  createdAt: Date;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeUsers: 0,
    securityAlerts: 0,
    recentRegistrations: 0,
    avgRiskScore: 0,
    complianceRate: 0
  });
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadStats(),
        loadSecurityAlerts(),
        loadRecentUsers()
      ]);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Get total users count
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get active users (logged in last 7 days)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { count: activeUsers } = await supabase
        .from('security_events')
        .select('user_id', { count: 'exact', head: true })
        .eq('event_type', 'login')
        .gte('created_at', sevenDaysAgo);

      // Get unacknowledged security alerts
      const { count: securityAlerts } = await supabase
        .from('security_alerts')
        .select('*', { count: 'exact', head: true })
        .eq('acknowledged', false);

      // Get recent registrations (last 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const { count: recentRegistrations } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo);

      // Get average risk score
      const { data: riskData } = await supabase
        .from('profiles')
        .select('risk_score')
        .not('risk_score', 'is', null);

      const avgRiskScore = riskData?.length 
        ? riskData.reduce((sum, profile) => sum + (profile.risk_score || 0), 0) / riskData.length
        : 0;

      // Calculate compliance rate (verified users)
      const { count: verifiedUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('verification_status', 'verified');

      const complianceRate = totalUsers ? (verifiedUsers || 0) / totalUsers * 100 : 0;

      setStats({
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        securityAlerts: securityAlerts || 0,
        recentRegistrations: recentRegistrations || 0,
        avgRiskScore,
        complianceRate
      });

    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const loadSecurityAlerts = async () => {
    try {
      const { data } = await supabase
        .from('security_alerts')
        .select('*')
        .eq('acknowledged', false)
        .order('created_at', { ascending: false })
        .limit(10);

      if (data) {
        const formattedAlerts = data.map(alert => ({
          id: alert.id,
          userId: alert.user_id,
          type: alert.alert_type,
          message: alert.message,
          timestamp: new Date(alert.created_at),
          acknowledged: alert.acknowledged
        }));
        setAlerts(formattedAlerts);
      }
    } catch (error) {
      console.error('Failed to load security alerts:', error);
    }
  };

  const loadRecentUsers = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select(`
          *,
          user:user_id (email)
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (data) {
        const formattedUsers = data.map(profile => ({
          id: profile.id,
          displayName: profile.display_name || 'Unknown',
          email: (profile.user as any)?.email || 'No email',
          verificationStatus: profile.verification_status || 'unverified',
          kycLevel: profile.kyc_level || 0,
          riskScore: profile.risk_score || 50,
          createdAt: new Date(profile.created_at)
        }));
        setUsers(formattedUsers);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const acknowledgeAlert = async (alertId: string) => {
    try {
      await supabase
        .from('security_alerts')
        .update({ acknowledged: true })
        .eq('id', alertId);

      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
      setStats(prev => ({ ...prev, securityAlerts: prev.securityAlerts - 1 }));
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
    }
  };

  const getVerificationBadge = (status: string) => {
    const variants = {
      verified: 'default',
      pending: 'secondary',
      unverified: 'outline',
      rejected: 'destructive'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status}
      </Badge>
    );
  };

  const getRiskLevelColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Admin Dashboard - ETO Trading"
        description="Administrative dashboard for user management, security monitoring, and compliance oversight"
      />
      
      <div className="max-w-7xl mx-auto p-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground">Platform management and monitoring</p>
          </div>
          <Button onClick={loadDashboardData} variant="outline">
            <Activity className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {stats.recentRegistrations} new this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Last 7 days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Security Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.securityAlerts}</div>
              <p className="text-xs text-muted-foreground">
                Unacknowledged
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.complianceRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                Verified users
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="alerts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="alerts">Security Alerts</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
          </TabsList>

          <TabsContent value="alerts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Security Alerts</CardTitle>
                <CardDescription>
                  Unacknowledged security events requiring attention
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {alerts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No pending security alerts</p>
                  </div>
                ) : (
                  alerts.map(alert => (
                    <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="destructive">{alert.type}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {alert.timestamp.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm">{alert.message}</p>
                        <p className="text-xs text-muted-foreground">User: {alert.userId}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => acknowledgeAlert(alert.id)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Acknowledge
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Users</CardTitle>
                <CardDescription>
                  Latest user registrations and profile information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map(user => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium">{user.displayName}</h4>
                          {getVerificationBadge(user.verificationStatus)}
                          <Badge variant="outline">KYC Level {user.kycLevel}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <p className="text-xs text-muted-foreground">
                          Registered: {user.createdAt.toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">Risk Score</p>
                        <p className={`text-lg font-bold ${getRiskLevelColor(user.riskScore)}`}>
                          {user.riskScore}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Compliance Overview</CardTitle>
                  <CardDescription>Platform compliance metrics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Average Risk Score</span>
                    <span className={`font-bold ${getRiskLevelColor(stats.avgRiskScore)}`}>
                      {stats.avgRiskScore.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Verification Rate</span>
                    <span className="font-bold text-green-600">
                      {stats.complianceRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Security Incidents</span>
                    <span className="font-bold text-red-600">
                      {stats.securityAlerts}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Compliance Actions</CardTitle>
                  <CardDescription>Quick compliance management tools</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full" variant="outline">
                    <UserCheck className="w-4 h-4 mr-2" />
                    Review Pending Verifications
                  </Button>
                  <Button className="w-full" variant="outline">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Generate Compliance Report
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Shield className="w-4 h-4 mr-2" />
                    Audit Security Events
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}