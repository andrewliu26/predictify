import { NextApiRequest, NextApiResponse } from 'next';

const BACKEND_URL = 'http://localhost:8000';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { slug, ...queryParams } = req.query;

    console.log('📝 API Route received request:', {
        method: req.method,
        slug,
        queryParams,
        url: req.url
    });

    try {
        // Remove slug from query parameters as it's used in the path
        const cleanedParams = { ...queryParams };
        delete cleanedParams.slug;

        // Construct the full URL including query parameters
        const searchParams = new URLSearchParams(cleanedParams as Record<string, string>);
        const backendPath = Array.isArray(slug) ? slug.join('/') : slug;
        const backendUrl = `${BACKEND_URL}/api/songs/${backendPath}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

        console.log('🔄 Forwarding request to backend:', backendUrl);

        const response = await fetch(backendUrl);
        console.log('📨 Backend response status:', response.status);

        const data = await response.json();
        console.log('✅ Backend response data:', {
            status: response.status,
            dataPreview: data.songs ? `${data.songs.length} songs` : 'No songs array'
        });

        if (!response.ok) {
            console.error('❌ Backend error:', data);
            return res.status(response.status).json(data);
        }

        return res.status(200).json(data);
    } catch (error) {
        console.error('🚨 API Route error:', error);

        // Check if it's a connection error
        if (error instanceof Error && 'code' in error && (error as any).code === 'ECONNREFUSED') {
            return res.status(503).json({
                error: 'Backend server is not running',
                details: 'Please ensure the backend server is started on port 8000'
            });
        }

        return res.status(500).json({
            error: 'Failed to fetch data',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}