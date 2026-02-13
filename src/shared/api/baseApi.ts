import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { supabase } from '@/lib/supabase';
import type { PostgrestError } from '@supabase/supabase-js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseQueryArgs<T = any> = {
    table: string;
    select?: string;
    filter?: Record<string, unknown>;
    single?: boolean;
    order?: { column: string; ascending?: boolean };
    range?: { from: number; to: number };
    id?: string;
    data?: T;
    method?: 'select' | 'insert' | 'update' | 'delete';
};

export const supabaseBaseQuery = () => async (args: SupabaseQueryArgs) => {
    try {
        const { table, select = '*', filter, single, order, range, id, data, method = 'select' } = args;

        let query = supabase.from(table);

        if (method === 'select') {
            let selectQuery = query.select(select, { count: 'exact' });

            if (filter) {
                Object.entries(filter).forEach(([key, value]) => {
                    if (value !== undefined && value !== null && value !== '') {
                        selectQuery = selectQuery.eq(key, value);
                    }
                });
            }

            if (order) {
                selectQuery = selectQuery.order(order.column, { ascending: order.ascending ?? true });
            }

            if (range) {
                selectQuery = selectQuery.range(range.from, range.to);
            }

            if (single || id) {
                if (id) {
                    selectQuery = selectQuery.eq('id', id);
                }
                const { data: result, error } = await selectQuery.single();
                if (error) throw error;
                return { data: result };
            }

            const { data: result, error, count } = await selectQuery;
            if (error) throw error;
            return { data: { items: result, count: count ?? 0 } };
        }

        throw new Error('Method not supported in this base query implementation for now');
    } catch (error) {
        const pgError = error as PostgrestError;
        return {
            error: {
                status: pgError.code || 'UNKNOWN',
                data: pgError.message || 'An error occurred',
            },
        };
    }
};

export const baseApi = createApi({
    reducerPath: 'api',
    baseQuery: fakeBaseQuery(),
    refetchOnReconnect: true,
    refetchOnMountOrArgChange: 300,
    keepUnusedDataFor: 600,
    tagTypes: [
        'Categories',
        'Category',
        'MenuItems',
        'MenuItem',
        'Organizations',
        'Organization',
    ],
    endpoints: () => ({}),
});
