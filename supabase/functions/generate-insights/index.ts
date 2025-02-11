
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { data, columns } = await req.json();

    const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY') || '');
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `Analyze this dataset with ${columns.join(', ')} as columns. 
    Provide insights about:
    1. Key patterns and trends
    2. Correlations between variables
    3. Interesting findings
    4. Suggested visualizations
    
    Format the response in HTML with proper headings and bullet points.
    
    Here's a sample of the data:
    ${JSON.stringify(data.slice(0, 5), null, 2)}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return new Response(
      JSON.stringify({ insights: text }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
