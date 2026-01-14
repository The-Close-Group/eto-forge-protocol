import { source } from '@/lib/source';
import { NextResponse } from 'next/server';

// Generate static search index for client-side search
export const dynamic = 'force-static';
export const revalidate = false;

export async function GET() {
  const pages = source.getPages();

  const searchIndex = pages.map((page) => ({
    title: page.data.title,
    description: page.data.description ?? '',
    url: page.url,
    content: page.data.structuredData?.contents?.map((c: { content: string }) => c.content).join(' ') ?? '',
  }));

  return NextResponse.json(searchIndex);
}
