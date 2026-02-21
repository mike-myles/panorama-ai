import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.VITE_APP_BASE || '/',
  plugins: [
    react(),
    {
      name: 'ai-intent-proxy',
      configureServer(server) {
        // Minimal dev-only endpoint: POST /api/intent { prompt: string }
        server.middlewares.use('/api/intent', (async (req: any, res: any) => {
          if (req.method !== 'POST') {
            res.statusCode = 405;
            res.end('Method Not Allowed');
            return;
          }
          try {
            const chunks: Uint8Array[] = [];
            await new Promise<void>((resolve, reject) => {
              req.on('data', (c: Uint8Array) => chunks.push(c));
              req.on('end', () => resolve());
              req.on('error', reject);
            });
            const bodyRaw = Buffer.concat(chunks).toString('utf-8') || '{}';
            const body = JSON.parse(bodyRaw);
            const prompt: string = String(body.prompt || '');

            const apiKey = process.env.OPENAI_API_KEY;
            const orgId = process.env.OPENAI_ORG_ID;
            const projectId = process.env.OPENAI_PROJECT || process.env.OPENAI_PROJECT_ID;
            const baseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
            const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

            if (!apiKey) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: 'OPENAI_API_KEY is not set in environment.' }));
              return;
            }

            // Ask the model to output strict JSON describing the desired UI intent
            const system = [
              'You are an intent parser for a marketing analytics dashboard.',
              'Output ONLY a JSON object with fields like:',
              '{',
              '  "reset": boolean,',
              '  "filters": {',
              '    "channels": string[],',
              '    "status": "active" | "at_risk" | "paused" | "all",',
              '    "roasRange": [number, number]',
              '  },',
              '  "campaignIds": string[]',
              '}',
              'No prose, no markdown.'
            ].join(' ');

            const resp = await fetch(`${baseUrl}/chat/completions`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${apiKey}`,
                ...(orgId ? { 'OpenAI-Organization': orgId } : {}),
                ...(projectId ? { 'OpenAI-Project': projectId } : {}),
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                model,
                response_format: { type: 'json_object' },
                temperature: 0,
                messages: [
                  { role: 'system', content: system },
                  { role: 'user', content: prompt }
                ]
              })
            });

            if (!resp.ok) {
              const errText = await resp.text();
              res.statusCode = 502;
              res.end(JSON.stringify({ error: 'OpenAI error', status: resp.status, detail: errText }));
              return;
            }

            const data = await resp.json();
            const content = (data?.choices?.[0]?.message?.content ?? '{}') as string;
            let intent: any = {};
            try {
              intent = JSON.parse(content);
            } catch {
              intent = {};
            }

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ intent }));
          } catch (e: any) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: e?.message || 'Unknown error' }));
          }
        }) as any);
      }
    }
  ],
  server: {
    port: 5175,
    open: true
  }
});

