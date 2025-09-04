// Supabase client that uses Vercel serverless function as proxy
// This helps bypass DNS resolution issues

export class SupabaseProxyClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = '/api/supabase-proxy';
  }

  async from(table: string) {
    return {
      select: (columns: string = '*') => ({
        eq: (column: string, value: any) => ({
          order: (column: string, options: { ascending: boolean } = { ascending: false }) => ({
            limit: (count: number) => this.makeRequest('GET', `${table}?select=${columns}&${column}=eq.${value}&order=${column}.${options.ascending ? 'asc' : 'desc'}&limit=${count}`)
          }),
          single: () => this.makeRequest('GET', `${table}?select=${columns}&${column}=eq.${value}&limit=1`).then(data => data[0])
        }),
        order: (column: string, options: { ascending: boolean } = { ascending: false }) => ({
          limit: (count: number) => this.makeRequest('GET', `${table}?select=${columns}&order=${column}.${options.ascending ? 'asc' : 'desc'}&limit=${count}`)
        }),
        limit: (count: number) => this.makeRequest('GET', `${table}?select=${columns}&limit=${count}`)
      }),
      insert: (data: any) => ({
        select: () => this.makeRequest('POST', table, data)
      }),
      update: (data: any) => ({
        eq: (column: string, value: any) => ({
          select: () => this.makeRequest('PATCH', `${table}?${column}=eq.${value}`, data)
        })
      }),
      delete: () => ({
        eq: (column: string, value: any) => this.makeRequest('DELETE', `${table}?${column}=eq.${value}`)
      })
    };
  }

  private async makeRequest(method: string, endpoint: string, body?: any) {
    try {
      console.log(`Making proxy request: ${method} ${endpoint}`);
      
      const response = await fetch(`${this.baseUrl}?endpoint=${endpoint}&method=${method}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Proxy request failed:', error);
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log(`Proxy request successful, got ${Array.isArray(data) ? data.length : 1} items`);
      return data;
    } catch (error) {
      console.error('Proxy request failed:', error);
      throw error;
    }
  }
}

export const supabaseProxy = new SupabaseProxyClient();