import { useState, useEffect } from 'react';
import { supabase, isMissingConfig } from './supabase';

export interface DbCategory {
    id: string;
    slug: string;
    name: string;
    icon: string;
    display_order: number;
    organization_id: string;
}

export interface DbPrice {
    id: string;
    size: string;
    price: number;
    menu_item_id: string;
}

export interface DbMenuItem {
    id: string;
    name: string;
    description: string | null;
    subcategory: string | null;
    category_id: string;
    organization_id: string;
    is_disabled: boolean;
    ibu: number | null;
    abv: number | null;
    wine_region: string | null;
    wine_country: string | null;
    wine_style: string | null;
    image_url: string | null;
    display_order: number;
    prices: DbPrice[];
    category?: DbCategory;
}

interface UseMenuResult {
    categories: DbCategory[];
    menuItems: DbMenuItem[];
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

/**
 * Fetch menu categories and items from Supabase
 * @param organizationSlug - Organization slug to filter by (e.g., "eighty-one")
 */
export function useMenu(organizationSlug: string = 'eighty-one'): UseMenuResult {
    const [categories, setCategories] = useState<DbCategory[]>([]);
    const [menuItems, setMenuItems] = useState<DbMenuItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        if (isMissingConfig) {
            setError('Supabase not configured');
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // First, get the organization
            const { data: org, error: orgError } = await supabase
                .from('organizations')
                .select('id')
                .eq('slug', organizationSlug)
                .single();

            if (orgError || !org) {
                throw new Error(`Organization not found: ${organizationSlug}`);
            }

            // Fetch categories
            const { data: categoriesData, error: catError } = await supabase
                .from('categories')
                .select('*')
                .eq('organization_id', org.id)
                .order('display_order', { ascending: true });

            if (catError) throw catError;

            // Fetch menu items with prices
            const { data: itemsData, error: itemsError } = await supabase
                .from('menu_items')
                .select(`
          *,
          prices (*),
          category:categories (*)
        `)
                .eq('organization_id', org.id)
                .eq('is_disabled', false)
                .order('display_order', { ascending: true });

            if (itemsError) throw itemsError;

            setCategories(categoriesData || []);
            setMenuItems(itemsData || []);
        } catch (err) {
            console.error('Failed to fetch menu:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch menu');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [organizationSlug]);

    return { categories, menuItems, isLoading, error, refetch: fetchData };
}

/**
 * Get menu items filtered by category
 */
export function useMenuByCategory(categorySlug: string, organizationSlug: string = 'eighty-one') {
    const { categories, menuItems, isLoading, error } = useMenu(organizationSlug);

    const category = categories.find(c => c.slug === categorySlug);
    const filteredItems = category
        ? menuItems.filter(item => item.category_id === category.id)
        : [];

    // Group by subcategory
    const groupedItems = filteredItems.reduce((acc, item) => {
        const subcategory = item.subcategory || 'Other';
        if (!acc[subcategory]) acc[subcategory] = [];
        acc[subcategory].push(item);
        return acc;
    }, {} as Record<string, DbMenuItem[]>);

    return { category, items: filteredItems, groupedItems, isLoading, error };
}
