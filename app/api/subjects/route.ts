import { NextResponse } from 'next/server';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
export async function GET() {
  try {
    
    const subjectsResponse = await fetch(`${API_URL}/subjects`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      }
    });

    if (!subjectsResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch subjects' },
        { status: subjectsResponse.status }
      );
    }

    const data = await subjectsResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
