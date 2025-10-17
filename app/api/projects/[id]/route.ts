import { NextRequest, NextResponse } from 'next/server';
import { getProjectById, updateProject, deleteProject } from '@/lib/db/business-queries';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = parseInt(resolvedParams.id);
    if (isNaN(id) || id <= 0) {
      return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 });
    }

    const project = await getProjectById(id);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    return NextResponse.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = parseInt(resolvedParams.id);
    if (isNaN(id) || id <= 0) {
      return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 });
    }

    const data = await request.json();
    console.log('PUT /api/projects - Received data:', data);
    
    // Convert date strings back to Date objects if they exist
    if (data.startDate && typeof data.startDate === 'string' && data.startDate.trim() !== '') {
      data.startDate = new Date(data.startDate);
    } else if (data.startDate === '') {
      data.startDate = null;
    }
    
    if (data.endDate && typeof data.endDate === 'string' && data.endDate.trim() !== '') {
      data.endDate = new Date(data.endDate);
    } else if (data.endDate === '') {
      data.endDate = null;
    }
    
    // Convert clientId to number or null
    if (data.clientId === '' || data.clientId === undefined) {
      data.clientId = null;
    } else if (typeof data.clientId === 'string') {
      data.clientId = parseInt(data.clientId);
    }
    
    console.log('PUT /api/projects - Processed data:', data);
    
    const project = await updateProject(id, data);
    console.log('PUT /api/projects - Updated project:', project);
    
    return NextResponse.json(project);
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update project' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = parseInt(resolvedParams.id);
    if (isNaN(id) || id <= 0) {
      return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 });
    }

    await deleteProject(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete project' },
      { status: 500 }
    );
  }
}
