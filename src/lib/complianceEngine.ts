import { supabase } from '@/integrations/supabase/client';

export interface KYCData {
  personalInfo: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    nationality: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  identityDocuments: {
    type: 'passport' | 'driver_license' | 'national_id';
    number: string;
    expiryDate: string;
    issuingCountry: string;
  }[];
  financialInfo: {
    employmentStatus: string;
    occupation: string;
    annualIncome: number;
    sourceOfFunds: string;
    netWorth: number;
  };
  riskAssessment: {
    score: number;
    level: 'low' | 'medium' | 'high';
    factors: string[];
  };
}

export interface ComplianceCheck {
  type: 'kyc' | 'aml' | 'sanctions' | 'pep' | 'transaction_monitoring';
  status: 'pending' | 'approved' | 'rejected' | 'requires_review';
  score: number;
  details: Record<string, any>;
  checkDate: Date;
  expiryDate?: Date;
}

class ComplianceEngine {
  async performKYCCheck(userId: string, kycData: KYCData): Promise<ComplianceCheck> {
    try {
      // Simulate KYC verification process
      const riskScore = this.calculateRiskScore(kycData);
      const riskLevel = this.determineRiskLevel(riskScore);
      
      const check: ComplianceCheck = {
        type: 'kyc',
        status: riskScore > 80 ? 'approved' : riskScore > 60 ? 'requires_review' : 'rejected',
        score: riskScore,
        details: {
          riskLevel,
          factors: this.identifyRiskFactors(kycData),
          documentVerification: await this.verifyDocuments(kycData.identityDocuments),
          addressVerification: await this.verifyAddress(kycData.personalInfo.address)
        },
        checkDate: new Date(),
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
      };

      // Store compliance record
      await this.storeComplianceRecord(userId, check);
      
      // Update user profile with KYC status
      await this.updateUserKYCStatus(userId, check);

      return check;

    } catch (error) {
      console.error('KYC check failed:', error);
      throw new Error('KYC verification failed');
    }
  }

  async performAMLCheck(userId: string, transactionData: Record<string, any>): Promise<ComplianceCheck> {
    try {
      const amlScore = this.calculateAMLScore(transactionData);
      
      const check: ComplianceCheck = {
        type: 'aml',
        status: amlScore > 70 ? 'approved' : amlScore > 40 ? 'requires_review' : 'rejected',
        score: amlScore,
        details: {
          transactionPattern: this.analyzeTransactionPattern(transactionData),
          sanctionsCheck: await this.checkSanctionsList(userId),
          pepCheck: await this.checkPEPList(userId),
          riskIndicators: this.identifyAMLRiskIndicators(transactionData)
        },
        checkDate: new Date()
      };

      await this.storeComplianceRecord(userId, check);
      return check;

    } catch (error) {
      console.error('AML check failed:', error);
      throw new Error('AML verification failed');
    }
  }

  async performTransactionMonitoring(userId: string, transaction: Record<string, any>): Promise<boolean> {
    try {
      const rules = await this.getMonitoringRules();
      let flagged = false;

      for (const rule of rules) {
        if (await this.evaluateRule(rule, transaction)) {
          flagged = true;
          await this.createComplianceAlert(userId, rule, transaction);
        }
      }

      return !flagged; // Return true if transaction is clean

    } catch (error) {
      console.error('Transaction monitoring failed:', error);
      return false;
    }
  }

  private calculateRiskScore(kycData: KYCData): number {
    let score = 100;
    
    // Age factor
    const age = this.calculateAge(kycData.personalInfo.dateOfBirth);
    if (age < 18) score -= 50;
    if (age < 25) score -= 10;
    if (age > 65) score -= 5;

    // Country risk
    const highRiskCountries = ['AF', 'KP', 'IR', 'SY']; // Simplified list
    if (highRiskCountries.includes(kycData.personalInfo.country)) {
      score -= 30;
    }

    // Income consistency
    if (kycData.financialInfo.annualIncome < 20000) score -= 10;
    if (kycData.financialInfo.annualIncome > 1000000) score -= 5; // High income can be suspicious

    // Document verification
    if (kycData.identityDocuments.length === 0) score -= 40;

    return Math.max(0, Math.min(100, score));
  }

  private determineRiskLevel(score: number): 'low' | 'medium' | 'high' {
    if (score >= 80) return 'low';
    if (score >= 60) return 'medium';
    return 'high';
  }

  private identifyRiskFactors(kycData: KYCData): string[] {
    const factors: string[] = [];
    
    const age = this.calculateAge(kycData.personalInfo.dateOfBirth);
    if (age < 18) factors.push('Underage');
    if (age < 25) factors.push('Young adult');

    if (kycData.financialInfo.annualIncome > 1000000) {
      factors.push('High income');
    }

    if (kycData.identityDocuments.length === 0) {
      factors.push('No identity documents');
    }

    return factors;
  }

  private async verifyDocuments(documents: KYCData['identityDocuments']): Promise<Record<string, any>> {
    // Simulate document verification
    return {
      verified: documents.length > 0,
      documentCount: documents.length,
      types: documents.map(doc => doc.type)
    };
  }

  private async verifyAddress(address: string): Promise<Record<string, any>> {
    // Simulate address verification
    return {
      verified: address.length > 10,
      confidence: address.length > 20 ? 'high' : 'medium'
    };
  }

  private calculateAMLScore(transactionData: Record<string, any>): number {
    let score = 100;
    
    // Transaction amount risk
    if (transactionData.amount > 10000) score -= 20;
    if (transactionData.amount > 100000) score -= 30;

    // Frequency risk
    if (transactionData.frequencyLast24h > 10) score -= 25;

    // Geographic risk
    if (transactionData.isInternational) score -= 10;

    return Math.max(0, Math.min(100, score));
  }

  private analyzeTransactionPattern(transactionData: Record<string, any>): Record<string, any> {
    return {
      isStructured: transactionData.amount > 9000 && transactionData.amount < 10000,
      highFrequency: transactionData.frequencyLast24h > 5,
      roundNumbers: transactionData.amount % 1000 === 0,
      offHours: this.isOffHours(transactionData.timestamp)
    };
  }

  private async checkSanctionsList(userId: string): Promise<boolean> {
    // Simulate sanctions list check
    // In reality, this would check against OFAC, UN, EU sanctions lists
    return Math.random() > 0.99; // 1% false positive for demo
  }

  private async checkPEPList(userId: string): Promise<boolean> {
    // Simulate PEP (Politically Exposed Person) check
    return Math.random() > 0.95; // 5% false positive for demo
  }

  private identifyAMLRiskIndicators(transactionData: Record<string, any>): string[] {
    const indicators: string[] = [];

    if (transactionData.amount > 10000) {
      indicators.push('Large transaction amount');
    }

    if (transactionData.isInternational) {
      indicators.push('International transaction');
    }

    if (transactionData.frequencyLast24h > 5) {
      indicators.push('High transaction frequency');
    }

    return indicators;
  }

  private async getMonitoringRules(): Promise<any[]> {
    // Return predefined monitoring rules
    return [
      {
        id: 'large_transaction',
        condition: (tx: any) => tx.amount > 50000,
        severity: 'high',
        description: 'Large transaction detected'
      },
      {
        id: 'velocity_check',
        condition: (tx: any) => tx.velocityLast24h > 100000,
        severity: 'medium',
        description: 'High transaction velocity'
      },
      {
        id: 'unusual_pattern',
        condition: (tx: any) => tx.isOffHours && tx.amount > 10000,
        severity: 'medium',
        description: 'Unusual transaction pattern'
      }
    ];
  }

  private async evaluateRule(rule: any, transaction: Record<string, any>): Promise<boolean> {
    try {
      return rule.condition(transaction);
    } catch (error) {
      console.error('Error evaluating rule:', rule.id, error);
      return false;
    }
  }

  private async createComplianceAlert(userId: string, rule: any, transaction: Record<string, any>): Promise<void> {
    await supabase.from('security_alerts').insert({
      user_id: userId,
      alert_type: 'suspicious_activity',
      message: `${rule.description}: Transaction ${transaction.id}`,
      acknowledged: false
    });
  }

  private async storeComplianceRecord(userId: string, check: ComplianceCheck): Promise<void> {
    // Store in a compliance_records table (would need to be created)
    console.log('Storing compliance record:', { userId, check });
  }

  private async updateUserKYCStatus(userId: string, check: ComplianceCheck): Promise<void> {
    const kycLevel = check.status === 'approved' ? 3 : check.status === 'requires_review' ? 2 : 1;
    
    await supabase
      .from('profiles')
      .upsert({
        user_id: userId,
        kyc_level: kycLevel,
        verification_status: check.status === 'approved' ? 'verified' : 'pending',
        risk_score: 100 - check.score
      });
  }

  private calculateAge(dateOfBirth: string): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  private isOffHours(timestamp: Date): boolean {
    const hour = timestamp.getHours();
    return hour < 6 || hour > 22; // Consider 10 PM to 6 AM as off-hours
  }
}

export const complianceEngine = new ComplianceEngine();