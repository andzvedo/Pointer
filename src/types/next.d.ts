// Declaração de tipos para next/server
declare module 'next/server' {
  export interface NextRequest extends Request {
    nextUrl: URL;
  }
} 