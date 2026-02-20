import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { ORGANIZATION_ID } from '@/lib/constants';
import type { User, Session } from '@supabase/supabase-js';

interface UserDiscount {
    discount_percent: number;
    label: string | null;
}

interface AuthState {
    user: User | null;
    session: Session | null;
    isLoading: boolean;
    discount: UserDiscount | null;

    // Actions
    initialize: () => () => void;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
    fetchDiscount: (userId: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
    user: null,
    session: null,
    isLoading: true,
    discount: null,

    initialize: () => {
        // Get the initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            set({
                session,
                user: session?.user ?? null,
                isLoading: false,
            });

            if (session?.user) {
                get().fetchDiscount(session.user.id);
                // Ensure profile exists
                ensureProfile(session.user);
            }
        });

        // Listen for auth changes (handles OAuth redirect callback)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                set({
                    session,
                    user: session?.user ?? null,
                    isLoading: false,
                });

                if (session?.user) {
                    get().fetchDiscount(session.user.id);
                    ensureProfile(session.user);
                } else {
                    set({ discount: null });
                }
            }
        );

        // Return cleanup function
        return () => {
            subscription.unsubscribe();
        };
    },

    signInWithGoogle: async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin,
            },
        });
        if (error) {
            console.error('Google sign-in error:', error);
            throw error;
        }
    },

    signOut: async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Sign-out error:', error);
            throw error;
        }
        set({ user: null, session: null, discount: null });
    },

    fetchDiscount: async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('user_discounts')
                .select('discount_percent, label')
                .eq('user_id', userId)
                .eq('organization_id', ORGANIZATION_ID)
                .eq('is_active', true)
                .single();

            if (error) {
                // No discount found is not an error
                if (error.code === 'PGRST116') {
                    set({ discount: null });
                    return;
                }
                console.error('Error fetching discount:', error);
                set({ discount: null });
                return;
            }

            set({ discount: data });
        } catch {
            set({ discount: null });
        }
    },
}));

/**
 * Ensure a profile row exists for the user (upsert on first Google login)
 */
async function ensureProfile(user: User) {
    try {
        const { error } = await supabase
            .from('profiles')
            .upsert(
                {
                    id: user.id,
                    display_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
                    language: 'en',
                },
                { onConflict: 'id' }
            );

        if (error) {
            console.error('Error upserting profile:', error);
        }
    } catch (err) {
        console.error('Error ensuring profile:', err);
    }
}
