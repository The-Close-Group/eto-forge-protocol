import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, userId } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Initialize Supabase client for database operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Define tools for the AI
    const tools = [
      {
        type: "function",
        function: {
          name: "get_portfolio",
          description: "Get user's portfolio balances and total value",
          parameters: {
            type: "object",
            properties: {},
            required: []
          }
        }
      },
      {
        type: "function",
        function: {
          name: "get_price",
          description: "Get current price of an asset (MAANG, USDC, ETH, AVAX, SOL)",
          parameters: {
            type: "object",
            properties: {
              asset: { type: "string", description: "Asset symbol" }
            },
            required: ["asset"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "execute_trade",
          description: "Execute a trade for the user. Returns a trade card component.",
          parameters: {
            type: "object",
            properties: {
              fromAsset: { type: "string", description: "Asset to sell" },
              toAsset: { type: "string", description: "Asset to buy" },
              amount: { type: "number", description: "Amount to trade" }
            },
            required: ["fromAsset", "toAsset", "amount"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "show_chart",
          description: "Display a price chart for an asset",
          parameters: {
            type: "object",
            properties: {
              asset: { type: "string", description: "Asset symbol" },
              timeframe: { type: "string", enum: ["1H", "1D", "1W", "1M"], description: "Chart timeframe" }
            },
            required: ["asset"]
          }
        }
      }
    ];

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { 
            role: 'system', 
            content: `You are ETO AI Trading Assistant. You help users trade MAANG tokens and other crypto assets.

CAPABILITIES:
- Get portfolio balances and stats
- Check real-time prices
- Execute trades (MAANG, USDC, ETH, AVAX, SOL)
- Display price charts
- Provide trading insights

IMPORTANT: 
- MAANG is priced at $33
- Always confirm trade details before executing
- Use tools to provide real data
- Be concise and actionable

When showing trades, charts, or portfolio data, use your tools to create interactive components.`
          },
          ...messages
        ],
        tools,
        tool_choice: "auto",
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limits exceeded, please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Payment required, please add funds to your Lovable AI workspace.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      return new Response(JSON.stringify({ error: 'AI gateway error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Handle streaming with tool calls
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();
    
    const stream = new ReadableStream({
      async start(controller) {
        let buffer = '';
        let toolCalls: any[] = [];
        
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';
            
            for (const line of lines) {
              if (!line.trim() || line.startsWith(':')) continue;
              if (!line.startsWith('data: ')) continue;
              
              const data = line.slice(6);
              if (data === '[DONE]') {
                controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                continue;
              }
              
              try {
                const parsed = JSON.parse(data);
                const delta = parsed.choices?.[0]?.delta;
                
                // Handle tool calls
                if (delta?.tool_calls) {
                  for (const toolCall of delta.tool_calls) {
                    if (!toolCalls[toolCall.index]) {
                      toolCalls[toolCall.index] = {
                        id: toolCall.id,
                        type: 'function',
                        function: { name: toolCall.function?.name || '', arguments: '' }
                      };
                    }
                    if (toolCall.function?.arguments) {
                      toolCalls[toolCall.index].function.arguments += toolCall.function.arguments;
                    }
                  }
                }
                
                // Pass through content
                controller.enqueue(encoder.encode(`data: ${data}\n\n`));
                
              } catch (e) {
                console.error('Parse error:', e);
              }
            }
          }
          
          // Execute tool calls if any
          if (toolCalls.length > 0 && userId) {
            for (const toolCall of toolCalls) {
              const args = JSON.parse(toolCall.function.arguments);
              let result: any = {};
              
              switch (toolCall.function.name) {
                case 'get_portfolio':
                  const { data: balances } = await supabase
                    .from('user_balances')
                    .select('*')
                    .eq('user_id', userId);
                  result = { type: 'portfolio', data: balances || [] };
                  break;
                  
                case 'get_price':
                  const prices: any = { MAANG: 33, USDC: 1, ETH: 3200, AVAX: 35, SOL: 140 };
                  result = { type: 'price', asset: args.asset, price: prices[args.asset] || 0 };
                  break;
                  
                case 'execute_trade':
                  result = { 
                    type: 'trade_card', 
                    fromAsset: args.fromAsset,
                    toAsset: args.toAsset,
                    amount: args.amount
                  };
                  break;
                  
                case 'show_chart':
                  result = { 
                    type: 'chart', 
                    asset: args.asset,
                    timeframe: args.timeframe || '1D'
                  };
                  break;
              }
              
              // Send tool result as custom event
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                type: 'tool_result',
                tool_call_id: toolCall.id,
                result
              })}\n\n`));
            }
          }
          
          controller.close();
        } catch (error) {
          console.error('Stream error:', error);
          controller.error(error);
        }
      }
    });

    return new Response(stream, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });
    
  } catch (error) {
    console.error('Chat assistant error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
