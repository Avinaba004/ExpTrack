import { NextResponse } from 'next/server';

export function middleware(req) {
    // Log the incoming request
    console.log(`Incoming request: ${req.method} ${req.url}`);

    // Add any additional middleware logic here

    return NextResponse.next();
}

export const config = {
    matcher: ['/api/chat/:path*'], // Apply this middleware to the chat API route
};