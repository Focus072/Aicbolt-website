import { NextRequest, NextResponse } from 'next/server';
import { getClients, createClient } from '@/lib/db/business-queries';
import { getCachedData, setCachedData, CacheKeys } from '@/lib/cache';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const cacheKey = `${CacheKeys.CLIENTS}${status ? `-${status}` : ''}`;

    // Check cache first
    const cached = getCachedData(cacheKey);
    if (cached) {
      return NextResponse.json(cached, {
        headers: {
          'Cache-Control': 'public, max-age=30',
          'X-Cache': 'HIT'
        }
      });
    }

    const clients = await getClients(status);
    
    // Cache the result
    setCachedData(cacheKey, clients);
    
    return NextResponse.json(clients, {
      headers: {
        'Cache-Control': 'public, max-age=30',
        'X-Cache': 'MISS'
      }
    });
  } catch (error) {
    console.error('Error fetching clients:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch clients';
    return NextResponse.json(
      { error: errorMessage, details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const client = await createClient(data);
    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    console.error('Error creating client:', error);
    return NextResponse.json(
      { error: 'Failed to create client' },
      { status: 500 }
    );
  }
}

