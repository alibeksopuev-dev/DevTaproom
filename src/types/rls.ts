export interface Organization {
    id: string;
    name: string;
    slug?: string;
    owner_id?: string;
    created_at?: string;
    updated_at?: string;
}

export interface Category {
    id: string;
    name: string;
    organization_id: string;
    sort_order?: number;
    created_at?: string;
    updated_at?: string;
}

export interface MenuItem {
    id: string;
    name: string;
    description?: string;
    category_id: string;
    organization_id: string;
    image_url?: string;
    is_available?: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface PricePerSize {
    id: string;
    menu_item_id: string;
    size: string;
    price: number;
    currency?: string;
    created_at?: string;
    updated_at?: string;
}
