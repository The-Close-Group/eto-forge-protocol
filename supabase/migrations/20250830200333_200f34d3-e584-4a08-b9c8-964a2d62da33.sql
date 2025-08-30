-- Create user balances table for persistent balance tracking
CREATE TABLE public.user_balances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  asset_symbol TEXT NOT NULL,
  balance DECIMAL(36, 18) NOT NULL DEFAULT 0,
  reserved_amount DECIMAL(36, 18) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, asset_symbol)
);

-- Create trade history table for tracking all trades
CREATE TABLE public.trade_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  from_asset TEXT NOT NULL,
  to_asset TEXT NOT NULL,
  from_amount DECIMAL(36, 18) NOT NULL,
  to_amount DECIMAL(36, 18) NOT NULL,
  execution_price DECIMAL(36, 18) NOT NULL,
  transaction_hash TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  fees DECIMAL(36, 18) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create portfolio snapshots for historical tracking
CREATE TABLE public.portfolio_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  total_value DECIMAL(36, 18) NOT NULL,
  total_invested DECIMAL(36, 18) NOT NULL,
  profit_loss DECIMAL(36, 18) NOT NULL,
  snapshot_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, snapshot_date)
);

-- Enable Row Level Security
ALTER TABLE public.user_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trade_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_snapshots ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_balances
CREATE POLICY "Users can view their own balances" 
ON public.user_balances 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own balances" 
ON public.user_balances 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own balances" 
ON public.user_balances 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create RLS policies for trade_history
CREATE POLICY "Users can view their own trades" 
ON public.trade_history 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own trades" 
ON public.trade_history 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trades" 
ON public.trade_history 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create RLS policies for portfolio_snapshots
CREATE POLICY "Users can view their own snapshots" 
ON public.portfolio_snapshots 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own snapshots" 
ON public.portfolio_snapshots 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own snapshots" 
ON public.portfolio_snapshots 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_user_balances_user_id ON public.user_balances(user_id);
CREATE INDEX idx_user_balances_asset ON public.user_balances(user_id, asset_symbol);
CREATE INDEX idx_trade_history_user_id ON public.trade_history(user_id);
CREATE INDEX idx_trade_history_created_at ON public.trade_history(user_id, created_at DESC);
CREATE INDEX idx_portfolio_snapshots_user_date ON public.portfolio_snapshots(user_id, snapshot_date DESC);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_user_balances_updated_at
BEFORE UPDATE ON public.user_balances
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_trade_history_updated_at
BEFORE UPDATE ON public.trade_history
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();