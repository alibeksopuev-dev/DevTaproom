import { baseApi } from '@/shared/api/baseApi';
import { supabase } from '@/lib/supabase';
import type { DbMenuItem, DbCategory } from '@/lib/useMenu';
import type { Product, Category } from '@/types/menu';

export type MenuItemFilters = {
    organization_id?: string;
    category_id?: string;
    name?: string;
    subcategory?: string;
    is_disabled?: boolean;
};

type GetMenuItemsParams = {
    limit: number;
    offset: number;
    filters?: MenuItemFilters;
};

type MenuItemsResponse = {
    items: DbMenuItem[];
    count: number;
};

export const menuItemsApi = baseApi.injectEndpoints({
    endpoints: (create) => ({
        getMenuItems: create.query<MenuItemsResponse, GetMenuItemsParams>({
            queryFn: async ({ limit, offset, filters }) => {
                let query = supabase
                    .from('menu_items')
                    .select('*, category:categories(*), price_per_size(*)', { count: 'exact' })
                    .order('name', { ascending: true })
                    .range(offset, offset + limit - 1);

                if (filters?.organization_id) {
                    query = query.eq('organization_id', filters.organization_id);
                }
                if (filters?.category_id) {
                    query = query.eq('category_id', filters.category_id);
                }
                if (filters?.name) {
                    // Use ilike for search, applied to name
                    // Note: Supabase 'or' with filtered columns can be tricky.
                    // For now, simple name search is safer than complex 'or' logic that failed before.
                    query = query.ilike('name', `%${filters.name}%`);
                }
                if (filters?.subcategory) {
                    query = query.eq('subcategory', filters.subcategory);
                }
                if (filters?.is_disabled !== undefined) {
                    query = query.eq('is_disabled', filters.is_disabled);
                }

                const { data, error, count } = await query;

                if (error) {
                    return { error: { status: error.code, data: error.message } };
                }

                return { data: { items: data as DbMenuItem[] ?? [], count: count ?? 0 } };
            },
            providesTags: ['MenuItems'],
            // Transform response to frontend types if needed, but for now returning raw DB items + count
            // Components can map them using toFrontendProduct
        }),

        getCategories: create.query<DbCategory[], void>({
            queryFn: async () => {
                const { data, error } = await supabase
                    .from('categories')
                    .select('*')
                    .order('name', { ascending: true });

                if (error) {
                    return { error: { status: error.code, data: error.message } };
                }

                return { data: data as DbCategory[] ?? [] };
            },
            providesTags: ['Categories'],
        }),
    }),
    overrideExisting: true,
});

export const { useGetMenuItemsQuery, useGetCategoriesQuery } = menuItemsApi;
