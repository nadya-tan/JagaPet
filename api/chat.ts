import type { VercelRequest, VercelResponse } from '@vercel/node';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_AI_GROQ_API_KEY,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({
        error: 'Method not allowed',
      });
    }

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({
        error: 'Groq API key is not configured.',
      });
    }

    const body =
      typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    const { message } = body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        error: 'Message is required.',
      });
    }

    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful assistant for an aquatic pet care web app. Give clear, safe, and beginner-friendly answers. If the user asks for medical certainty, remind them that a vet or aquatic specialist should confirm serious issues.',
        },
        {
          role: 'user',
          content: message,
        },
      ],
      temperature: 0.3,
      max_tokens: 700,
    });

    const answer = completion.choices[0]?.message?.content ?? '';

    return res.status(200).json({
      answer,
    });
  } catch (error) {
    console.error('Groq chat error:', error);

    return res.status(500).json({
      error: 'Failed to get response from Groq.',
    });
  }
}