import { useState, useEffect, useMemo } from 'react';
import { supabase, isMissingConfig } from './supabase';
import type { Product, Category, ProductPrice } from '@/types/menu';

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
    // Map prices
    const prices: ProductPrice[] = db.price_per_size.map(p => ({
        id: p.id,
        size: p.size,
        price: p.price,
    })).sort((a, b) => a.price - b.price); // Sort by price usually makes sense

    // Default price is the lowest price or 0 if no prices
    const defaultPrice = prices.length > 0 ? prices[0].price : 0;

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
        metadata: buildProductMetadata(ibu, abv, meta),
        rawMetadata: meta || undefined, // Pass through all raw metadata
        prices: prices.length > 0 ? prices : undefined,
    };
}

function buildProductMetadata(
    ibu?: number,
    abv?: number,
    meta?: Record<string, unknown> | null
): Product['metadata'] {
    const result: Product['metadata'] = {};

    // Parse numeric values if stored as strings
    const parseNumber = (value: unknown): number | undefined => {
        if (typeof value === 'number') return value;
        if (typeof value === 'string') {
            const parsed = parseFloat(value);
            return isNaN(parsed) ? undefined : parsed;
        }
        return undefined;
    };

    // Beer metadata - support both direct params and metadata object
    const ibuValue = ibu ?? parseNumber(meta?.ibu);
    const abvValue = abv ?? parseNumber(meta?.abv);

    if (ibuValue !== undefined || abvValue !== undefined) {
        result.beer = {
            ibu: ibuValue ?? 0,
            abv: abvValue ?? 0,
        };
    }

    // Wine metadata - support both old and new field names
    const region = (meta?.region || meta?.wine_region) as string | undefined;
    const country = (meta?.country || meta?.wine_country) as string | undefined;
    const grapeVariety = (meta?.grapeVariety || meta?.grape_variety) as string | undefined;
    const style = (meta?.style || meta?.wine_style) as string | undefined;

    if (region || country || grapeVariety || style) {
        result.wine = {
            region: region ?? '',
            country: country ?? '',
            grapeVariety: grapeVariety,
            style: style,
        };
    }

    // Tags (if present)
    if (meta?.tags && Array.isArray(meta.tags)) {
        result.tags = meta.tags as string[];
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
