import { baseApiAi } from "./baseApiAi";

export interface BusinessCategory {
  category: string;
  business_count: number;
}

export interface BusinessCategoryResponse {
  total_categories: number;
  categories: BusinessCategory[];
  count: number;
}

export const businessCategoryApi = baseApiAi.injectEndpoints({
  endpoints: (builder) => ({
    getBusinessCategories: builder.query<BusinessCategoryResponse, void>({
      query: () => "/businesses/management/categories",
      providesTags: ["BusinessManagement"] as any,
    }),
  }),
});

export const { useGetBusinessCategoriesQuery } = businessCategoryApi;
