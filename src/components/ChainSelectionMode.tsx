
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Zap, Settings, Check } from "lucide-react";

interface ChainSelectionModeProps {
  mode: "auto" | "manual";
  onModeChange: (mode: "auto" | "manual") => void;
  recommendedChain?: string;
}

export function ChainSelectionMode({ mode, onModeChange, recommendedChain }: ChainSelectionModeProps) {
  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Chain Selection Mode</Label>
      
      <div className="grid grid-cols-2 gap-3">
        <Card 
          className={`cursor-pointer transition-all duration-200 ${
            mode === "auto" 
              ? 'border-primary bg-primary/10' 
              : 'border-border hover:bg-accent/50'
          }`}
          onClick={() => onModeChange("auto")}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Auto-Select</span>
                  {mode === "auto" && <Check className="h-3 w-3 text-primary" />}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Optimal routing & fees
                </p>
              </div>
            </div>
            
            {mode === "auto" && recommendedChain && (
              <div className="mt-3 pt-3 border-t border-border/50">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground">Recommended:</span>
                  <span className="text-primary font-medium">{recommendedChain}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Lowest fees & fastest execution
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all duration-200 ${
            mode === "manual" 
              ? 'border-primary bg-primary/10' 
              : 'border-border hover:bg-accent/50'
          }`}
          onClick={() => onModeChange("manual")}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <Settings className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Manual</span>
                  {mode === "manual" && <Check className="h-3 w-3 text-primary" />}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Choose your chain
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
