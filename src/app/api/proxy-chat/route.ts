import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory rate limiting (for production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_REQUESTS = 10; // Max requests per window
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute window

function getClientIP(req: NextRequest): string {
  return req.headers.get('x-forwarded-for') || 
         req.headers.get('x-real-ip') || 
         'unknown';
}

function isRateLimited(clientIP: string): boolean {
  const now = Date.now();
  const clientData = rateLimitMap.get(clientIP);
  
  if (!clientData || now > clientData.resetTime) {
    // Reset or initialize
    rateLimitMap.set(clientIP, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  
  if (clientData.count >= RATE_LIMIT_REQUESTS) {
    return true;
  }
  
  clientData.count++;
  return false;
}

export async function POST(req: NextRequest) {
  try {
    // Rate limiting check
    const clientIP = getClientIP(req);
    if (isRateLimited(clientIP)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait before sending another message.' }, 
        { status: 429 }
      );
    }

    const body = await req.json();
    
    // Validate input
    if (!body.message || typeof body.message !== 'string') {
      return NextResponse.json({ error: 'Invalid message format' }, { status: 400 });
    }
    
    // Use environment variable for webhook URL in production
    const webhookUrl = process.env.N8N_WEBHOOK_URL || 'https://mushroomagency.app.n8n.cloud/webhook/chat';

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const text = await response.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      // If not JSON, wrap as reply
      data = { reply: text };
    }

    // Check if the response has a reply field, if not, try to extract it from common patterns
    let finalData: { reply: string; pdfUrl?: string };
    
    // Handle n8n array response format first
    if (Array.isArray(data) && data.length > 0) {
      const firstItem = data[0];
      const reply = firstItem.output || firstItem.message || firstItem.text || firstItem.content || JSON.stringify(firstItem);
      const pdfUrl = firstItem.pdfUrl || firstItem.url || firstItem.link;
      
      finalData = { reply };
      if (pdfUrl) {
        finalData.pdfUrl = pdfUrl;
      }
    } else if (data.reply) {
      // If it already has a reply field, use it as is
      finalData = { reply: data.reply };
      if (data.pdfUrl) {
        finalData.pdfUrl = data.pdfUrl;
      }
    } else if (data.data && data.data.reply) {
      finalData = { reply: data.data.reply };
      if (data.data.pdfUrl) {
        finalData.pdfUrl = data.data.pdfUrl;
      }
    } else if (data.response && data.response.reply) {
      finalData = { reply: data.response.reply };
      if (data.response.pdfUrl) {
        finalData.pdfUrl = data.response.pdfUrl;
      }
    } else if (data.message) {
      finalData = { reply: data.message };
      if (data.pdfUrl) {
        finalData.pdfUrl = data.pdfUrl;
      }
    } else if (data.text) {
      finalData = { reply: data.text };
      if (data.pdfUrl) {
        finalData.pdfUrl = data.pdfUrl;
      }
    } else if (data.content) {
      finalData = { reply: data.content };
      if (data.pdfUrl) {
        finalData.pdfUrl = data.pdfUrl;
      }
    } else if (typeof data === 'string') {
      finalData = { reply: data };
    } else {
      // If we can't find a reply, use the whole response as a fallback
      finalData = { reply: JSON.stringify(data) };
      if (data.pdfUrl) {
        finalData.pdfUrl = data.pdfUrl;
      }
    }

    return NextResponse.json(finalData, { status: response.status });
  } catch (err) {
    console.error('Proxy error:', err);
    return NextResponse.json({ error: 'Proxy error', details: String(err) }, { status: 500 });
  }
} 