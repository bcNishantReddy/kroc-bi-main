
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { data, columns } = await req.json();

    if (!data || !columns) {
      throw new Error('Missing required data or columns');
    }

    console.log('Generating insights for columns:', columns);
    console.log('Sample data:', data.slice(0, 2));

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a data analyst assistant that provides insights about datasets. Format your response in HTML with proper headings and bullet points."
          },
          {
            role: "user",
            content: `Analyze this dataset with columns: ${columns.join(', ')}. 
            Provide insights about:
            1. Key patterns and trends
            2. Correlations between variables
            3. Interesting findings
            4. Suggested visualizations
            
            Here's a sample of the data:
            ${JSON.stringify(data.slice(0, 5), null, 2)}`
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const result = await response.json();
    const insights = result.choices[0].message.content;

    console.log('Successfully generated insights');

    return new Response(
      JSON.stringify({ insights }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'An unexpected error occurred', 
        details: error.message,
        stack: error.stack 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    );
  }
});
