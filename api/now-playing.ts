import type { IncomingMessage, ServerResponse } from 'http';
import fetch from 'node-fetch';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    const response = await fetch("https://api.radioparadise.com/api/now_playing");
    if (!response.ok) {
      throw new Error(`External API responded with ${response.status}`);
    }
    const data = await response.json();
    
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
  } catch (error) {
    console.error("Metadata fetch error:", error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: "Failed to fetch metadata" }));
  }
}
