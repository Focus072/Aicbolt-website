import { getUser } from '@/lib/db/queries';
import { getCachedData, setCachedData, CacheKeys } from '@/lib/cache';

export async function GET() {
  // Check cache first
  const cached = getCachedData(CacheKeys.USER);
  if (cached) {
    return Response.json(cached, {
      headers: {
        'Cache-Control': 'public, max-age=30',
        'X-Cache': 'HIT'
      }
    });
  }

  const user = await getUser();
  
  // Cache the result
  setCachedData(CacheKeys.USER, user);
  
  return Response.json(user, {
    headers: {
      'Cache-Control': 'public, max-age=30',
      'X-Cache': 'MISS'
    }
  });
}
