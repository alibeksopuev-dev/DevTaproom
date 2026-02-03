import { useState, useEffect, useMemo } from 'react';
import { supabase, isMissingConfig } from './supabase';
import type { Product, Category } from '@/types/menu';

// ==========================================
// Supabase DB types (match actual schema)
// ==========================================

export interface DbPrice {
    id: string;
    size: string;
    price: number;
    menu_item_id: string;
}

export interface DbCategory {
    id: string;
    slug: string;
    name: string;
    organization_id: string;
    created_at: string;
    updated_at: string;
}

export interface DbMenuItem {
    id: string;
    name: string;
    description: string | null;
    subcategory: string | null;
    category_id: string;
    organization_id: string;
    is_disabled: boolean;
    image_url: string | null;
    metadata: Record<string, unknown> | null;
    created_at: string;
    updated_at: string;
    price_per_size: DbPrice[];
    category?: DbCategory;
}

// ==========================================
// Conversion helpers: DB → Frontend types
// ==========================================

/**
 * Convert DB category to frontend Category type
 */
export function toFrontendCategory(db: DbCategory, index: number): Category {
    return {
        id: db.slug as Category['id'], // Use slug as category ID for routing
        name: db.name,
        nameVi: db.name, // For now, English only (translations can be added later)
        nameJa: db.name,
        nameKo: db.name,
        icon: getCategoryIcon(db.slug), // Derive icon from slug
        order: index + 1,
    };
}

/**
 * Get category icon based on slug
 */
function getCategoryIcon(slug: string): string {
    const icons: Record<string, string> = {
        'beers': '🍺',
        'craft-beer': '🍺',
        'snacks': '🍽️',
        'drinks': '🍷',
        'wines': '🍾',
        'bottles': '🥫',
        'bottles-cans': '🥫',
    };
    return icons[slug] || '📦';
}

/**
 * Convert DB menu item to frontend Product type for cart compatibility
 */
export function toFrontendProduct(db: DbMenuItem, categorySlug: string): Product {
    // Extract prices for beer sizes
    const price033 = db.price_per_size.find(p => p.size === '0.33L')?.price;
    const price050 = db.price_per_size.find(p => p.size === '0.50L')?.price;
    const defaultPrice = db.price_per_size[0]?.price ?? 0;

    // Extract metadata (ibu, abv, wine info)
    const meta = db.metadata as Record<string, unknown> | null;
    const ibu = meta?.ibu as number | undefined;
    const abv = meta?.abv as number | undefined;

    return {
        id: db.id,
        name: db.name,
        description: db.description ?? '',
        price: defaultPrice,
        category: categorySlug as Product['category'],
        subcategory: db.subcategory ?? undefined,
        metadata: buildProductMetadata(price033, price050, ibu, abv, meta),
    };
}

function buildProductMetadata(
    price033?: number,
    price050?: number,
    ibu?: number,
    abv?: number,
    meta?: Record<string, unknown> | null
): Product['metadata'] {
    const result: Product['metadata'] = {};

    // Beer metadata
    if (ibu !== undefined || abv !== undefined || price033 || price050) {
        result.beer = {
            ibu: ibu ?? 0,
            abv: abv ?? 0,
            size033ml: price033,
            size050ml: price050,
        };
    }

    // Wine metadata (if present)
    if (meta?.wine_region || meta?.wine_country || meta?.wine_style) {
        result.wine = {
            region: (meta.wine_region as string) ?? '',
            country: (meta.wine_country as string) ?? '',
            style: (meta.wine_style as string) ?? undefined,
        };
    }

    return Object.keys(result).length > 0 ? result : undefined;
}

// ==========================================
// Main Hook
// ==========================================

interface UseMenuResult {
    categories: Category[];
    menuItems: Product[];
    dbCategories: DbCategory[];
    dbMenuItems: DbMenuItem[];
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

/**
 * Fetch menu categories and items from Supabase
 * @param organizationId - Organization ID to filter by
 */
export function useMenu(organizationId: string = 'dbd4b576-8e6b-474f-b04e-a983b414fa5f'): UseMenuResult {
    const [dbCategories, setDbCategories] = useState<DbCategory[]>([]);
    const [dbMenuItems, setDbMenuItems] = useState<DbMenuItem[]>([]);
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
            // Fetch all categories (shared across organizations)
            const { data: categoriesData, error: catError } = await supabase
                .from('categories')
                .select('*')
                .order('name', { ascending: true });

            if (catError) throw catError;

            // Fetch menu items with prices
            const { data: itemsData, error: itemsError } = await supabase
                .from('menu_items')
                .select(`
                    *,
                    price_per_size (*),
                    category:categories (*)
                `)
                .eq('organization_id', organizationId)
                .eq('is_disabled', false)
                .order('name', { ascending: true });

            if (itemsError) throw itemsError;

            setDbCategories(categoriesData || []);
            setDbMenuItems(itemsData || []);
        } catch (err) {
            console.error('Failed to fetch menu:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch menu');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [organizationId]);

    // Convert to frontend types
    const categories = useMemo(() =>
        dbCategories.map((cat, idx) => toFrontendCategory(cat, idx)),
        [dbCategories]
    );

    const menuItems = useMemo(() =>
        dbMenuItems.map(item => {
            const categorySlug = item.category?.slug ?? 'unknown';
            return toFrontendProduct(item, categorySlug);
        }),
        [dbMenuItems]
    );

    return {
        categories,
        menuItems,
        dbCategories,
        dbMenuItems,
        isLoading,
        error,
        refetch: fetchData
    };
}

/**
 * Get menu items filtered by category slug
 */
export function useMenuByCategory(categorySlug: string, organizationId: string = 'dbd4b576-8e6b-474f-b04e-a983b414fa5f') {
    const { categories, menuItems, isLoading, error } = useMenu(organizationId);

    const category = categories.find(c => c.id === categorySlug);

    // Filter items by category slug
    const filteredItems = useMemo(() =>
        menuItems.filter(item => item.category === categorySlug),
        [menuItems, categorySlug]
    );

    // Group by subcategory
    const groupedItems = useMemo(() =>
        filteredItems.reduce((acc, item) => {
            const subcategory = item.subcategory || 'Other';
            if (!acc[subcategory]) acc[subcategory] = [];
            acc[subcategory].push(item);
            return acc;
        }, {} as Record<string, Product[]>),
        [filteredItems]
    );

    return { category, items: filteredItems, groupedItems, isLoading, error };
}
