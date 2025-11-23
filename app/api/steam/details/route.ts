import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const appidsParam = searchParams.get('appids');

    if (!appidsParam) {
        return NextResponse.json(
            { error: 'appids query parameter is required' },
            { status: 400 }
        );
    }

    // Parse and validate appids
    const appids = appidsParam.split(',')
        .map(id => id.trim())
        .filter(id => /^\d+$/.test(id));

    if (appids.length === 0) {
        return NextResponse.json(
            { error: 'No valid appids provided' },
            { status: 400 }
        );
    }

    if (appids.length > 100) {
        return NextResponse.json(
            { error: 'Too many appids. Max 100 allowed.' },
            { status: 400 }
        );
    }

    // Batching logic
    // Note: Steam Storefront API often returns null for multi-appid requests requesting full details.
    // We use batch size of 1 to ensure reliability, effectively making this sequential.
    const BATCH_SIZE = 1;
    const batches = [];
    for (let i = 0; i < appids.length; i += BATCH_SIZE) {
        batches.push(appids.slice(i, i + BATCH_SIZE));
    }

    const mergedResults: Record<string, any> = {};

    try {
        // Process batches sequentially
        for (const batch of batches) {
            const batchData = await fetchBatchWithRetry(batch);
            Object.assign(mergedResults, batchData);
            // Add a small delay to avoid rate limiting since we are making multiple requests
            if (batches.length > 1) {
                await new Promise(resolve => setTimeout(resolve, 200));
            }
        }

        return NextResponse.json(mergedResults);
    } catch (error) {
        console.error('Steam API error:', error);
        return NextResponse.json(
            { error: 'Steam API error' },
            { status: 500 }
        );
    }
}

async function fetchBatchWithRetry(appids: string[], retries = 1): Promise<any> {
    const url = `https://store.steampowered.com/api/appdetails?appids=${appids.join(',')}`;

    try {
        const response = await fetch(url, {
            headers: {
                // Steam API requires a User-Agent to avoid 403 Forbidden
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
                'Accept': 'application/json',
                'Accept-Language': 'en-US,en;q=0.9'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Basic validation that we got an object back
        if (!data || typeof data !== 'object') {
            throw new Error('Invalid response format from Steam');
        }

        return data;
    } catch (error) {
        if (retries > 0) {
            // Simple retry logic
            return fetchBatchWithRetry(appids, retries - 1);
        }
        throw error;
    }
}
