import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { generateUUID } from '@/lib/utils';
import { User, Shield, Bell, FileText, Key, Webhook, Upload } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSecurity } from '@/contexts/SecurityContext';
import { supabase } from '@/integrations/supabase/client';
import { auditLogger } from '@/lib/auditLogger';
import SEO from '@/components/SEO';

const profileSchema = z.object({
  displayName: z.string().min(2, 'Display name must be at least 2 characters'),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  company: z.string().optional(),
  role: z.string().optional(),
  phone: z.string().optional()
});

const notificationSchema = z.object({
  emailAlerts: z.boolean(),
  pushNotifications: z.boolean(),
  securityAlerts: z.boolean(),
  marketAlerts: z.boolean(),
  orderAlerts: z.boolean()
});

type ProfileFormData = z.infer<typeof profileSchema>;
type NotificationFormData = z.infer<typeof notificationSchema>;

interface UserProfile {
  displayName: string;
  bio: string;
  company: string;
  role: string;
  phone: string;
  verificationStatus: string;
  kycLevel: number;
  riskScore: number;
}

interface APIKey {
  id: string;
  name: string;
  keyPreview: string;
  permissions: string[];
  lastUsed: Date | null;
  expiresAt: Date | null;
  isActive: boolean;
}

export default function UserSettings() {
  const { user } = useAuth();
  const { logSecurityEvent } = useSecurity();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    pushNotifications: false,
    securityAlerts: true,
    marketAlerts: false,
    orderAlerts: true
  });

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: '',
      bio: '',
      company: '',
      role: '',
      phone: ''
    }
  });

  const notificationForm = useForm<NotificationFormData>({
    resolver: zodResolver(notificationSchema),
    defaultValues: notifications
  });

  useEffect(() => {
    if (user?.id) {
      loadUserProfile();
      loadAPIKeys();
    }
  }, [user?.id]);

  const loadUserProfile = async () => {
    if (!user?.id) return;

    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) {
        const profileData = {
          displayName: data.display_name || '',
          bio: data.bio || '',
          company: data.company || '',
          role: data.role || '',
          phone: data.phone || '',
          verificationStatus: data.verification_status || 'unverified',
          kycLevel: data.kyc_level || 0,
          riskScore: data.risk_score || 50
        };

        setProfile(profileData);
        profileForm.reset({
          displayName: profileData.displayName,
          bio: profileData.bio,
          company: profileData.company,
          role: profileData.role,
          phone: profileData.phone
        });
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive"
      });
    }
  };

  const loadAPIKeys = async () => {
    if (!user?.id) return;

    try {
      const { data } = await supabase
        .from('api_keys')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data) {
        const formattedKeys = data.map(key => ({
          id: key.id,
          name: key.name,
          keyPreview: `${key.key_hash.substring(0, 8)}...`,
          permissions: key.permissions as string[] || [],
          lastUsed: key.last_used_at ? new Date(key.last_used_at) : null,
          expiresAt: key.expires_at ? new Date(key.expires_at) : null,
          isActive: key.is_active
        }));
        setApiKeys(formattedKeys);
      }
    } catch (error) {
      console.error('Failed to load API keys:', error);
    }
  };

  const onProfileSubmit = async (data: ProfileFormData) => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          display_name: data.displayName,
          bio: data.bio,
          company: data.company,
          role: data.role,
          phone: data.phone
        });

      await auditLogger.logSettingsChange(user.id, 'profile', { changes: data });

      toast({
        title: "Success",
        description: "Profile updated successfully"
      });

      await loadUserProfile();
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onNotificationSubmit = async (data: NotificationFormData) => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      // Store notification preferences (you might want to create a separate table for this)
      localStorage.setItem('notification-preferences', JSON.stringify(data));
      setNotifications({
        emailAlerts: data.emailAlerts,
        pushNotifications: data.pushNotifications,
        securityAlerts: data.securityAlerts,
        marketAlerts: data.marketAlerts,
        orderAlerts: data.orderAlerts
      });

      await auditLogger.logSettingsChange(user.id, 'notifications', { preferences: data });

      toast({
        title: "Success",
        description: "Notification preferences updated"
      });
    } catch (error) {
      console.error('Failed to update notifications:', error);
      toast({
        title: "Error",
        description: "Failed to update notification preferences",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateAPIKey = async () => {
    if (!user?.id) return;

    const keyName = prompt('Enter a name for this API key:');
    if (!keyName) return;

    try {
      const keyHash = generateUUID() + generateUUID();
      
      await supabase
        .from('api_keys')
        .insert({
          user_id: user.id,
          name: keyName,
          key_hash: keyHash,
          permissions: ['read'],
          expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year
        });

      await auditLogger.log({
        action: 'api_key_created',
        resource: 'api_key',
        userId: user.id,
        details: { keyName },
        riskLevel: 'medium'
      });

      toast({
        title: "API Key Created",
        description: `New API key "${keyName}" has been generated`,
      });

      await loadAPIKeys();
    } catch (error) {
      console.error('Failed to generate API key:', error);
      toast({
        title: "Error",
        description: "Failed to generate API key",
        variant: "destructive"
      });
    }
  };

  const revokeAPIKey = async (keyId: string) => {
    if (!user?.id) return;

    try {
      await supabase
        .from('api_keys')
        .update({ is_active: false })
        .eq('id', keyId);

      await auditLogger.log({
        action: 'api_key_revoked',
        resource: 'api_key',
        userId: user.id,
        details: { keyId },
        riskLevel: 'medium'
      });

      toast({
        title: "API Key Revoked",
        description: "The API key has been deactivated"
      });

      await loadAPIKeys();
    } catch (error) {
      console.error('Failed to revoke API key:', error);
      toast({
        title: "Error",
        description: "Failed to revoke API key",
        variant: "destructive"
      });
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

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="User Settings - ETO Trading"
        description="Manage your profile, security settings, notifications, and API keys"
      />
      
      <div className="max-w-4xl mx-auto p-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage your account and preferences</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="api">API Keys</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Profile Information
                </CardTitle>
                <CardDescription>
                  Update your personal information and profile details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={profileForm.control}
                        name="displayName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Display Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="company"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Role</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={profileForm.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bio</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={3} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? 'Updating...' : 'Update Profile'}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Security Status
                </CardTitle>
                <CardDescription>
                  Monitor your account security and risk assessment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Verification Status</span>
                      {getVerificationBadge(profile.verificationStatus)}
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">KYC Level</span>
                      <Badge variant="outline">Level {profile.kycLevel}</Badge>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Risk Score</span>
                      <span className={`font-bold ${getRiskLevelColor(profile.riskScore)}`}>
                        {profile.riskScore}/100
                      </span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Configure how you receive alerts and updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...notificationForm}>
                  <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-6">
                    <div className="space-y-4">
                      {[
                        { name: 'emailAlerts', label: 'Email Alerts', description: 'Receive notifications via email' },
                        { name: 'pushNotifications', label: 'Push Notifications', description: 'Browser push notifications' },
                        { name: 'securityAlerts', label: 'Security Alerts', description: 'Important security notifications' },
                        { name: 'marketAlerts', label: 'Market Alerts', description: 'Price and market updates' },
                        { name: 'orderAlerts', label: 'Order Alerts', description: 'Trade execution notifications' }
                      ].map((item) => (
                        <FormField
                          key={item.name}
                          control={notificationForm.control}
                          name={item.name as keyof NotificationFormData}
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">{item.label}</FormLabel>
                                <div className="text-sm text-muted-foreground">
                                  {item.description}
                                </div>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>

                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? 'Updating...' : 'Update Preferences'}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="api" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  API Keys
                </CardTitle>
                <CardDescription>
                  Manage API keys for programmatic access to your account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    API keys allow external applications to access your account data
                  </p>
                  <Button onClick={generateAPIKey} size="sm">
                    Generate New Key
                  </Button>
                </div>

                <div className="space-y-3">
                  {apiKeys.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Key className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No API keys generated yet</p>
                    </div>
                  ) : (
                    apiKeys.map(key => (
                      <div key={key.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{key.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Key: {key.keyPreview}
                          </p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant={key.isActive ? 'default' : 'secondary'}>
                              {key.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            {key.expiresAt && (
                              <Badge variant="outline">
                                Expires: {key.expiresAt.toLocaleDateString()}
                              </Badge>
                            )}
                          </div>
                        </div>
                        {key.isActive && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => revokeAPIKey(key.id)}
                          >
                            Revoke
                          </Button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Compliance & Verification
                </CardTitle>
                <CardDescription>
                  Manage identity verification and compliance documents
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-8">
                  <Upload className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <h3 className="font-medium mb-2">Document Verification</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload identity documents to increase your verification level
                  </p>
                  <Button variant="outline">
                    Upload Documents
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}