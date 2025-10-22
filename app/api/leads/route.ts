import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { leads } from '@/lib/db/schema';
import { eq, desc, sql, and } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';
import { checkRateLimit, getClientIdentifier, RateLimits } from '@/lib/rate-limit';

// API Key validation - Used by n8n scraper
const VALID_API_KEY = process.env.SCRAPER_API_KEY;

function validateApiKey(request: NextRequest): boolean {
  // Check if API key is configured
  if (!VALID_API_KEY) {
    console.error('SCRAPER_API_KEY is not configured in environment variables');
    return false;
  }

  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  
  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  return token === VALID_API_KEY;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientId = getClientIdentifier(request);
    const rateLimit = checkRateLimit(clientId, RateLimits.LEADS_POST);
    
    if (!rateLimit.success) {
      return NextResponse.json(
        { 
          error: 'Too many requests',
          limit: rateLimit.limit,
          reset: rateLimit.reset 
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': String(rateLimit.limit),
            'X-RateLimit-Remaining': String(rateLimit.remaining),
            'X-RateLimit-Reset': String(rateLimit.reset),
            'Retry-After': String(Math.ceil((rateLimit.reset * 1000 - Date.now()) / 1000)),
          }
        }
      );
    }

    // Validate API key
    if (!validateApiKey(request)) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid or missing API key' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate required fields
    if (!body.place_id || !body.title) {
      return NextResponse.json(
        { error: 'Missing required fields: place_id and title are required' },
        { status: 400 }
      );
    }

    // Map incoming data to database schema
    const leadData = {
      placeId: body.place_id,
      action: body.action || body.ACTION || null,
      status: body.status || body.STATUS || 'new',
      title: body.title,
      email: body.email || null,
      name: body.name || null,
      firstname: body.firstname || null,
      lastname: body.lastname || null,
      phone: body.phone || null,
      cleanUrl: body.clean_url || body.cleanUrl || null,
      website: body.website || null,
      wpApi: body.wp_api || body.wpApi || null,
      wp: body.wp || null,
      facebook: body.facebook || null,
      instagram: body.instagram || null,
      youtube: body.youtube || null,
      tiktok: body.tiktok || null,
      twitter: body.twitter || null,
      linkedin: body.linkedin || null,
      pinterest: body.pinterest || null,
      reddit: body.reddit || null,
      rating: body.rating ? String(body.rating) : null,
      reviews: body.reviews || null,
      type: body.type || null,
      address: body.address || null,
      gpsCoordinates: body.gps_coordinates || body.gpsCoordinates || null,
      types: body.types || null,
      // notes: body.notes || null, // Temporarily disabled - column doesn't exist in DB
    };

    // Check if lead already exists before upsert
    const existingLead = await db
      .select({ id: leads.id })
      .from(leads)
      .where(eq(leads.placeId, leadData.placeId))
      .limit(1);

    const isNew = existingLead.length === 0;

    // Use PostgreSQL UPSERT with ON CONFLICT
    let result;

    try {
      // Use Drizzle's onConflict for proper upsert
      const [upsertedLead] = await db
        .insert(leads)
        .values(leadData)
        .onConflictDoUpdate({
          target: leads.placeId,
          set: {
            action: leadData.action,
            status: leadData.status,
            title: leadData.title,
            email: leadData.email,
            name: leadData.name,
            firstname: leadData.firstname,
            lastname: leadData.lastname,
            phone: leadData.phone,
            cleanUrl: leadData.cleanUrl,
            website: leadData.website,
            wpApi: leadData.wpApi,
            wp: leadData.wp,
            facebook: leadData.facebook,
            instagram: leadData.instagram,
            youtube: leadData.youtube,
            tiktok: leadData.tiktok,
            twitter: leadData.twitter,
            linkedin: leadData.linkedin,
            pinterest: leadData.pinterest,
            reddit: leadData.reddit,
            rating: leadData.rating,
            reviews: leadData.reviews,
            type: leadData.type,
            address: leadData.address,
            gpsCoordinates: leadData.gpsCoordinates,
            types: leadData.types,
            // notes: leadData.notes || null, // Temporarily disabled - column doesn't exist in DB
          }
        })
        .returning();
      
      result = upsertedLead;
      console.log(`Lead ${isNew ? 'created' : 'updated'} for place_id: ${leadData.placeId}, ID: ${result.id}`);
    } catch (error: any) {
      console.error('Unexpected error during upsert:', error);
      throw error;
    }

    console.log(`Lead ${isNew ? 'created' : 'updated'} for place_id: ${leadData.placeId}, ID: ${result.id}`);
    
    return NextResponse.json(
      {
        success: true,
        message: isNew ? 'Lead created successfully' : 'Lead updated successfully',
        data: result,
        isNew,
      },
      { status: isNew ? 201 : 200 }
    );

  } catch (error) {
    console.error('Error processing lead:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to process lead';
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined 
      },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve leads (for dashboard and external API)
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const clientId = getClientIdentifier(request);
    const rateLimit = checkRateLimit(clientId, RateLimits.LEADS_GET);
    
    // Check for API key (external) or session auth (internal dashboard)
    const hasValidApiKey = validateApiKey(request);
    const user = await getUser();
    const isMainAdmin = user?.username === 'admin';
    const isAdmin = user?.role === 'admin' || user?.role === 'owner' || isMainAdmin;

    // Allow access if either has valid API key OR is authenticated admin
    if (!hasValidApiKey && !isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid credentials or insufficient permissions' },
        { status: 401 }
      );
    }
    
    // Apply rate limit (but don't block admins as harshly)
    if (!rateLimit.success && !isAdmin) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50'); // Default 50 per page
    const offset = (page - 1) * limit;
    
    // Cap maximum limit for performance
    const cappedLimit = Math.min(limit, 1000);
    
    // Filter by status if provided
    const whereClause = status ? eq(leads.status, status as any) : undefined;
    
    const result = await db
      .select()
      .from(leads)
      .where(whereClause)
      .orderBy(desc(leads.createdAt))
      .limit(cappedLimit)
      .offset(offset);
    
    // Get total count for pagination
    const [countResult] = await db
      .select({ count: sql`COUNT(*)::int` })
      .from(leads)
      .where(whereClause);
    
    const total = Number(countResult?.count) || 0;
    
    const response = NextResponse.json({
      success: true,
      count: result.length,
      total,
      page,
      limit: cappedLimit,
      totalPages: Math.ceil(total / cappedLimit),
      data: result,
    });

    // Add caching headers (cache for 1 minute for authenticated requests)
    response.headers.set('Cache-Control', 'private, max-age=60, stale-while-revalidate=30');
    
    return response;

  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    );
  }
}

