import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, Zap, DollarSign, Star, CheckCircle } from "lucide-react";

interface BlockchainOption {
  id: string;
  name: string;
  logo: string;
  feeUsd: number;
  feePercentage: number;
  processingTime: string;
  processingSeconds: number;
  congestion: "low" | "medium" | "high";
  isRecommended?: boolean;
}

export function BlockchainSelector() {
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USDC");
  
  const getBlockchainOptions = (amount: number): BlockchainOption[] => {
    // ETO L1 is the only supported chain
    const baseOptions: BlockchainOption[] = [
      {
        id: "eto-l1",
        name: "ETO L1",
        logo: "⚡",
        feeUsd: 0.001,
        feePercentage: (0.001 / amount) * 100,
        processingTime: "~2 seconds",
        processingSeconds: 2,
        congestion: "low",
        isRecommended: true
      },
    ];

    return baseOptions;
  };

  const amountValue = parseFloat(amount) || 0;
  const blockchainOptions = amountValue > 0 ? getBlockchainOptions(amountValue) : [];
  const recommendedOption = blockchainOptions.find(option => option.isRecommended);
  const otherOptions = blockchainOptions.filter(option => !option.isRecommended);

  const getCongestionColor = (congestion: "low" | "medium" | "high") => {
    switch (congestion) {
      case "low": return "text-green-500";
      case "medium": return "text-yellow-500";
      case "high": return "text-red-500";
    }
  };

  const getFeeColor = (percentage: number) => {
    if (percentage < 0.1) return "text-green-500";
    if (percentage < 1) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="w-full md:w-80 space-y-4 bg-background p-4 border-b md:border-b-0 md:border-r border-border">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-foreground">Transaction Setup</h2>
        <p className="text-sm text-muted-foreground">
          Choose the best blockchain for your transaction
        </p>
      </div>

      {/* Amount Input */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Transaction Amount</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1"
            />
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USDC">USDC</SelectItem>
                <SelectItem value="MAANG">MAANG</SelectItem>
                <SelectItem value="sMAANG">sMAANG</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {amountValue > 0 && (
            <div className="text-xs text-muted-foreground">
              ≈ ${amountValue.toLocaleString()} USD
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recommended Option */}
      {recommendedOption && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-primary fill-primary" />
              <CardTitle className="text-sm text-primary">Recommended</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{recommendedOption.logo}</span>
                  <span className="font-medium">{recommendedOption.name}</span>
                </div>
                <CheckCircle className="h-4 w-4 text-primary" />
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{recommendedOption.processingTime}</span>
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  <span className={getFeeColor(recommendedOption.feePercentage)}>
                    ${recommendedOption.feeUsd.toFixed(2)}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  <span className={`text-xs ${getCongestionColor(recommendedOption.congestion)}`}>
                    {recommendedOption.congestion} congestion
                  </span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {recommendedOption.feePercentage.toFixed(3)}% fee
                </Badge>
              </div>
              
              <Button className="w-full" size="sm">
                Select {recommendedOption.name}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Other Options */}
      {otherOptions.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Other Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {otherOptions.map((option) => (
              <div
                key={option.id}
                className="border rounded-lg p-3 hover:bg-accent/50 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{option.logo}</span>
                    <span className="font-medium text-sm">{option.name}</span>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getFeeColor(option.feePercentage)}`}
                  >
                    {option.feePercentage.toFixed(3)}%
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-2">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{option.processingTime}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    <span>${option.feeUsd.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  <span className={`text-xs ${getCongestionColor(option.congestion)}`}>
                    {option.congestion} congestion
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {amountValue === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <div className="text-muted-foreground">
              <DollarSign className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Enter a transaction amount</p>
              <p className="text-xs">to see blockchain recommendations</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
