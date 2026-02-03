import { useState, useEffect } from 'react';
import { supabase, isMissingConfig } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

export function RLSTest() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [user, setUser] = useState<User | null>(null);
    const [result, setResult] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<string | null>(null);

    // Check for existing session on mount
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogin = async () => {
        setLoading('login');
        setError('');
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) throw error;
            setUser(data.user);
            setResult(JSON.stringify({ message: 'Login successful', user: data.user?.email }, null, 2));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed');
        } finally {
            setLoading(null);
        }
    };

    const handleLogout = async () => {
        setLoading('logout');
        setError('');
        try {
            await supabase.auth.signOut();
            setUser(null);
            setResult('');
            setEmail('');
            setPassword('');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Logout failed');
        } finally {
            setLoading(null);
        }
    };

    const runTest = async (testName: string, testFn: () => Promise<unknown>) => {
        setLoading(testName);
        setError('');
        setResult('');
        try {
            const data = await testFn();
            setResult(JSON.stringify(data, null, 2));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Test failed');
        } finally {
            setLoading(null);
        }
    };

    const getOrganizations = () => runTest('organizations', async () => {
        const { data, error } = await supabase.from('organizations').select('*');
        if (error) throw error;
        return { count: data?.length ?? 0, data };
    });

    const getCategories = () => runTest('categories', async () => {
        const { data, error } = await supabase.from('categories').select('*');
        if (error) throw error;
        return { count: data?.length ?? 0, data };
    });

    const getMenuItems = () => runTest('menu_items', async () => {
        const { data, error } = await supabase.from('menu_items').select('*');
        if (error) throw error;
        return { count: data?.length ?? 0, data };
    });

    const getPrices = () => runTest('prices', async () => {
        const { data, error } = await supabase.from('price_per_size').select('*');
        if (error) throw error;
        return { count: data?.length ?? 0, data };
    });

    const createOrganization = () => runTest('create_org', async () => {
        const { data, error } = await supabase
            .from('organizations')
            .insert({ name: `Test Org ${Date.now()}` })
            .select()
            .single();
        if (error) throw error;
        return { message: 'Organization created successfully', data };
    });

    const checkSuperAdmin = () => runTest('super_admin', async () => {
        const { data, error } = await supabase.rpc('is_super_admin');
        if (error) throw error;
        return { is_super_admin: data };
    });

    const TestButton = ({
        onClick,
        testKey,
        children
    }: {
        onClick: () => void;
        testKey: string;
        children: React.ReactNode;
    }) => (
        <button
            onClick={onClick}
            disabled={loading !== null}
            className={`
        px-4 py-3 rounded-lg font-medium transition-all duration-200
        ${loading === testKey
                    ? 'bg-indigo-400 text-white cursor-wait'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'
                }
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
        >
            {loading === testKey ? (
                <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Loading...
                </span>
            ) : children}
        </button>
    );

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                        Supabase RLS Tester
                    </h1>
                    <p className="text-gray-400 mt-2">Test Row Level Security policies</p>
                </div>

                {/* Missing Config Warning */}
                {isMissingConfig && (
                    <div className="bg-yellow-900/50 border border-yellow-500 rounded-xl p-4 mb-2">
                        <h3 className="text-yellow-400 font-semibold mb-2">⚠️ Configuration Required</h3>
                        <p className="text-yellow-300 text-sm">
                            Please create a <code className="bg-yellow-900 px-1 rounded">.env</code> file with your Supabase credentials:
                        </p>
                        <pre className="mt-2 bg-gray-900 p-3 rounded text-xs text-gray-300 font-mono">
                            {`VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key`}
                        </pre>
                    </div>
                )}

                {/* Auth Section */}
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                        Authentication
                    </h2>

                    {user ? (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-lg font-bold">
                                    {user.email?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-medium">{user.email}</p>
                                    <p className="text-sm text-gray-400">Logged in</p>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                disabled={loading === 'logout'}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors disabled:opacity-50"
                            >
                                {loading === 'logout' ? 'Logging out...' : 'Logout'}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                                    className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                            <button
                                onClick={handleLogin}
                                disabled={loading === 'login' || !email || !password}
                                className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading === 'login' ? 'Logging in...' : 'Login'}
                            </button>
                        </div>
                    )}
                </div>

                {/* Test Buttons */}
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                        RLS Tests
                    </h2>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <TestButton onClick={getOrganizations} testKey="organizations">
                            Get Organizations
                        </TestButton>
                        <TestButton onClick={getCategories} testKey="categories">
                            Get Categories
                        </TestButton>
                        <TestButton onClick={getMenuItems} testKey="menu_items">
                            Get Menu Items
                        </TestButton>
                        <TestButton onClick={getPrices} testKey="prices">
                            Get Prices
                        </TestButton>
                        <TestButton onClick={createOrganization} testKey="create_org">
                            Create Organization
                        </TestButton>
                        <TestButton onClick={checkSuperAdmin} testKey="super_admin">
                            Check if Super Admin
                        </TestButton>
                    </div>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="bg-red-900/50 border border-red-500 rounded-xl p-4">
                        <h3 className="text-red-400 font-semibold mb-1">Error</h3>
                        <p className="text-red-300">{error}</p>
                    </div>
                )}

                {/* Results Display */}
                {result && (
                    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            Results
                        </h2>
                        <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm text-gray-300 font-mono whitespace-pre-wrap">
                            {result}
                        </pre>
                    </div>
                )}

                {/* Environment Status */}
                <div className="text-center text-sm text-gray-500">
                    <p>
                        Supabase URL: {import.meta.env.VITE_SUPABASE_URL ? '✅ Configured' : '❌ Missing'}
                        {' | '}
                        Anon Key: {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Configured' : '❌ Missing'}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default RLSTest;
