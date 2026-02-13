import { baseApi } from '@/shared/api/baseApi';
import { supabase } from '@/lib/supabase';

export interface Organization {
    id: string;
    name: string;
    slug: string;
    logo_url: string | null;
    primary_color: string | null;
    is_disabled: boolean;
}

export const organizationsApi = baseApi.injectEndpoints({
    endpoints: (create) => ({
        getOrganizationById: create.query<Organization, string>({
            queryFn: async (id) => {
                const { data, error } = await supabase
                    .from('organizations')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (error) {
                    return { error: { status: error.code, data: error.message } };
                }

                return { data: data as Organization };
            },
            providesTags: (_result, _error, id) => [{ type: 'Organization', id }],
        }),
    }),
    overrideExisting: true,
});

export const { useGetOrganizationByIdQuery } = organizationsApi;
