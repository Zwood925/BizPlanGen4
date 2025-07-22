import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'Chat API is working!' });
}

export async function POST(req: NextRequest) {
  try {
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
    console.error('API error:', err);
    return NextResponse.json({ error: 'API error', details: String(err) }, { status: 500 });
  }
} 