import { NextRequest, NextResponse } from 'next/server';
import { getProjects, createProject } from '@/lib/db/business-queries';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;

    const projects = await getProjects(status);
    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch projects';
    return NextResponse.json(
      { error: errorMessage, details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    console.log('POST /api/projects - Received data:', data);
    
    // Convert date strings back to Date objects if they exist
    if (data.startDate && typeof data.startDate === 'string' && data.startDate.trim() !== '') {
      data.startDate = new Date(data.startDate);
    } else {
      data.startDate = null;
    }
    
    if (data.endDate && typeof data.endDate === 'string' && data.endDate.trim() !== '') {
      data.endDate = new Date(data.endDate);
    } else {
      data.endDate = null;
    }
    
    // Convert clientId to number or null
    if (data.clientId === '' || data.clientId === undefined) {
      data.clientId = null;
    } else if (typeof data.clientId === 'string') {
      data.clientId = parseInt(data.clientId);
    }
    
    console.log('POST /api/projects - Processed data:', data);
    
    const project = await createProject(data);
    console.log('POST /api/projects - Created project:', project);
    
    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create project' },
      { status: 500 }
    );
  }
}

