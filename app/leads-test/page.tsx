'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { ShieldAlert } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Send,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
  Database,
  Key,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

const MOCK_LEAD_DATA = {
  place_id: "ChIJN1t_tDeuEmsRUsoyG83frY4",
  title: "ABC Plumbing Services",
  name: "ABC Plumbing",
  email: "contact@abcplumbing.com",
  phone: "+1-555-0123",
  firstname: "John",
  lastname: "Smith",
  website: "https://abcplumbing.com",
  clean_url: "abcplumbing.com",
  address: "123 Main St, Los Angeles, CA 90001",
  gps_coordinates: "34.0522,-118.2437",
  rating: "4.5",
  reviews: 127,
  type: "Plumbing",
  facebook: "https://facebook.com/abcplumbing",
  instagram: "https://instagram.com/abcplumbing",
  twitter: "https://twitter.com/abcplumbing",
  status: "new",
};

export default function LeadsTestPage() {
  const router = useRouter();
  const { data: user } = useSWR('/api/user', fetcher);
  const [apiKey, setApiKey] = useState('');
  const [payload, setPayload] = useState(JSON.stringify(MOCK_LEAD_DATA, null, 2));
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [lastStatus, setLastStatus] = useState<'success' | 'error' | null>(null);

  // Admin check - only allow in development or for admins
  const isMainAdmin = user?.email === 'galaljobah@gmail.com';
  const isAdmin = user?.role === 'admin' || user?.role === 'owner' || isMainAdmin;
  const isDevelopment = process.env.NODE_ENV === 'development';

  useEffect(() => {
    // In production, only admins can access this page
    if (!isDevelopment && user && !isAdmin) {
      router.push('/dashboard');
      toast.error('Test console is only available to administrators.');
    }
  }, [user, isAdmin, isDevelopment, router]);

  // Show access denied in production for non-admins
  if (!isDevelopment && (!user || !isAdmin)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-orange-950/20 p-6 flex items-center justify-center">
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-12 shadow-2xl max-w-md">
          <div className="flex flex-col items-center justify-center text-center">
            <ShieldAlert className="h-16 w-16 text-orange-500 mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Admin Access Required</h2>
            <p className="text-gray-400">
              The test console is only available to administrators in production.
            </p>
            <Button
              onClick={() => router.push('/dashboard')}
              className="mt-6 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/30"
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleTest = async () => {
    if (!apiKey.trim()) {
      toast.error('Please enter your SCRAPER_API_KEY');
      return;
    }

    setLoading(true);
    setResponse(null);
    setLastStatus(null);

    try {
      // Parse payload to validate JSON
      let parsedPayload;
      try {
        parsedPayload = JSON.parse(payload);
      } catch (e) {
        toast.error('Invalid JSON in payload');
        setLoading(false);
        return;
      }

      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(parsedPayload),
      });

      const data = await res.json();
      setResponse({ status: res.status, data });

      if (res.ok) {
        setLastStatus('success');
        toast.success(
          <div className="flex flex-col gap-1">
            <p className="font-semibold">✅ Lead Posted Successfully!</p>
            <p className="text-sm">{data.message}</p>
            <p className="text-xs text-gray-400">
              {data.isNew ? 'New lead created' : 'Existing lead updated'}
            </p>
          </div>,
          { duration: 5000 }
        );
      } else {
        setLastStatus('error');
        toast.error(
          <div className="flex flex-col gap-1">
            <p className="font-semibold">❌ Request Failed</p>
            <p className="text-sm">{data.error || 'Unknown error'}</p>
          </div>,
          { duration: 5000 }
        );
      }
    } catch (error) {
      setLastStatus('error');
      setResponse({ error: String(error) });
      toast.error(
        <div className="flex flex-col gap-1">
          <p className="font-semibold">❌ Network Error</p>
          <p className="text-sm">{error instanceof Error ? error.message : 'Failed to connect to API'}</p>
        </div>,
        { duration: 5000 }
      );
    } finally {
      setLoading(false);
    }
  };

  const resetToMock = () => {
    setPayload(JSON.stringify(MOCK_LEAD_DATA, null, 2));
    setResponse(null);
    setLastStatus(null);
  };

  const generateRandomLead = () => {
    const randomId = Math.random().toString(36).substring(7);
    const businesses = ['Plumbing', 'Electrical', 'HVAC', 'Roofing', 'Landscaping'];
    const randomBusiness = businesses[Math.floor(Math.random() * businesses.length)];
    
    const randomLead = {
      ...MOCK_LEAD_DATA,
      place_id: `test_${randomId}`,
      title: `${randomBusiness} Services ${randomId}`,
      name: `${randomBusiness} Co`,
      email: `contact${randomId}@${randomBusiness.toLowerCase()}.com`,
      phone: `+1-555-${Math.floor(1000 + Math.random() * 9000)}`,
      type: randomBusiness,
    };
    
    setPayload(JSON.stringify(randomLead, null, 2));
    setResponse(null);
    setLastStatus(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-orange-950/20 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6 shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <Database className="h-8 w-8 text-orange-400" />
                Leads API Test Console
              </h1>
              <p className="text-gray-400">
                Test your n8n integration before going live
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                asChild
                className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/30 hover:border-orange-500/50"
              >
                <Link href="/leads">
                  View Leads Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Status Banner */}
        {lastStatus === 'success' && (
          <div className="backdrop-blur-xl bg-green-500/10 rounded-2xl border border-green-500/30 p-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-400" />
              <div>
                <p className="text-green-400 font-semibold">Success! Lead posted to database</p>
                <p className="text-green-400/70 text-sm">
                  Check the Leads Dashboard to see your data
                </p>
              </div>
            </div>
          </div>
        )}

        {lastStatus === 'error' && (
          <div className="backdrop-blur-xl bg-red-500/10 rounded-2xl border border-red-500/30 p-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <XCircle className="h-6 w-6 text-red-400" />
              <div>
                <p className="text-red-400 font-semibold">Request failed</p>
                <p className="text-red-400/70 text-sm">
                  Check the response below for details
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Configuration */}
          <div className="space-y-6">
            {/* API Key */}
            <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6 shadow-2xl">
              <div className="flex items-center gap-2 mb-4">
                <Key className="h-5 w-5 text-orange-400" />
                <h2 className="text-xl font-bold text-white">API Authentication</h2>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  SCRAPER_API_KEY *
                </label>
                <Input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your SCRAPER_API_KEY from .env.local"
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-orange-500/50 font-mono"
                />
                <p className="text-xs text-gray-500 mt-2">
                  This is the Bearer token used to authenticate with /api/leads
                </p>
              </div>
            </div>

            {/* Payload Editor */}
            <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Request Payload</h2>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={resetToMock}
                    className="bg-white/5 hover:bg-white/10 text-white border border-white/10"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Reset
                  </Button>
                  <Button
                    size="sm"
                    onClick={generateRandomLead}
                    className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20"
                  >
                    Generate Random
                  </Button>
                </div>
              </div>
              <div>
                <textarea
                  value={payload}
                  onChange={(e) => setPayload(e.target.value)}
                  rows={18}
                  className="w-full px-4 py-3 bg-gray-950/50 border border-white/10 rounded-xl text-white font-mono text-sm focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 resize-none"
                  placeholder="Enter JSON payload..."
                />
                <p className="text-xs text-gray-500 mt-2">
                  Modify this JSON to test different scenarios
                </p>
              </div>
            </div>

            {/* Test Button */}
            <Button
              onClick={handleTest}
              disabled={loading}
              className="w-full bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/30 hover:border-orange-500/50 h-12 text-base font-semibold transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Sending Request...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5 mr-2" />
                  POST to /api/leads
                </>
              )}
            </Button>
          </div>

          {/* Right Column - Response */}
          <div className="space-y-6">
            {/* Quick Info */}
            <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6 shadow-2xl">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="h-5 w-5 text-blue-400" />
                <h2 className="text-xl font-bold text-white">Quick Info</h2>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5" />
                  <div>
                    <p className="text-sm text-gray-300 font-medium">Endpoint</p>
                    <code className="text-xs text-orange-400 bg-orange-500/10 px-2 py-1 rounded">
                      POST /api/leads
                    </code>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5" />
                  <div>
                    <p className="text-sm text-gray-300 font-medium">Required Fields</p>
                    <p className="text-xs text-gray-400">place_id, title</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5" />
                  <div>
                    <p className="text-sm text-gray-300 font-medium">Upsert Logic</p>
                    <p className="text-xs text-gray-400">Updates if place_id exists, creates if new</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Response Display */}
            <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">API Response</h2>
                {response && (
                  <Badge
                    className={
                      response.status >= 200 && response.status < 300
                        ? 'bg-green-500/10 text-green-400 border-green-500/20'
                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                    }
                  >
                    {response.status}
                  </Badge>
                )}
              </div>
              {response ? (
                <div>
                  <div className="bg-gray-950/50 border border-white/10 rounded-xl p-4 overflow-x-auto">
                    <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap">
                      {JSON.stringify(response.data || response, null, 2)}
                    </pre>
                  </div>
                  
                  {response.status >= 200 && response.status < 300 && (
                    <div className="mt-4 p-4 bg-green-500/5 border border-green-500/20 rounded-xl">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                        <div>
                          <p className="text-green-400 font-medium text-sm">Success!</p>
                          <p className="text-green-400/70 text-xs mt-1">
                            Lead {response.data?.isNew ? 'created' : 'updated'} in database
                          </p>
                          <Button
                            asChild
                            size="sm"
                            className="mt-3 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20"
                          >
                            <Link href="/leads">
                              View in Leads Dashboard →
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {response.status >= 400 && (
                    <div className="mt-4 p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
                      <div className="flex items-start gap-2">
                        <XCircle className="h-5 w-5 text-red-400 mt-0.5" />
                        <div>
                          <p className="text-red-400 font-medium text-sm">Error Details</p>
                          <p className="text-red-400/70 text-xs mt-1">
                            {response.status === 401 && 'Invalid or missing API key'}
                            {response.status === 400 && 'Invalid request data'}
                            {response.status === 500 && 'Server error - check logs'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-gray-950/30 border border-dashed border-white/10 rounded-xl p-8 text-center">
                  <Database className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">
                    Response will appear here after sending request
                  </p>
                </div>
              )}
            </div>

            {/* Common Error Codes */}
            <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6 shadow-2xl">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">Common Status Codes</h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-500/10 text-green-400 border-green-500/20 w-12 justify-center">201</Badge>
                  <span className="text-gray-400">Lead created successfully</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 w-12 justify-center">200</Badge>
                  <span className="text-gray-400">Lead updated (already exists)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-red-500/10 text-red-400 border-red-500/20 w-12 justify-center">401</Badge>
                  <span className="text-gray-400">Unauthorized - Invalid API key</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-red-500/10 text-red-400 border-red-500/20 w-12 justify-center">400</Badge>
                  <span className="text-gray-400">Bad request - Missing required fields</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="backdrop-blur-xl bg-blue-500/5 rounded-2xl border border-blue-500/20 p-6 shadow-2xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-blue-400 mb-2">Testing Instructions</h3>
              <ol className="text-xs text-blue-400/80 space-y-1 list-decimal list-inside">
                <li>Get your SCRAPER_API_KEY from .env.local and paste it above</li>
                <li>Review or modify the JSON payload (use "Generate Random" for variety)</li>
                <li>Click "POST to /api/leads" to send the request</li>
                <li>Check the response - green = success, red = error</li>
                <li>Visit Leads Dashboard to see the data appear instantly</li>
                <li>Test again with same place_id to verify update logic</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

