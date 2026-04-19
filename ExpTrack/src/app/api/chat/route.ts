import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { detectIntent } from '@/lib/ai/intentDetector';
import { processQuery } from '@/lib/ai/queryProcessor';

const prisma = new PrismaClient();

export async function POST(request: Request) {
    const { question } = await request.json();

    if (!question) {
        return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }

    const intent = detectIntent(question);
    let response;

    try {
        response = await processQuery(intent, prisma);
    } catch (error) {
        return NextResponse.json({ error: 'Error processing query' }, { status: 500 });
    }

    return NextResponse.json({ response });
}