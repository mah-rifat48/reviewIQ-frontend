import { baseApiAi } from "./baseApiAi";

export const addlocationApi = baseApiAi.injectEndpoints({
    endpoints: (builder) => ({
        addLocation: builder.mutation<any, {
            business_name: string;
            location: string;
            maps_url: string;
            phone_no: string;
            user_id: string;
            website: string;
        }>({
            query: (data) => ({
                url: "/businesses/locations",
                method: "PATCH",
                body: data,
            }),
            invalidatesTags: ["Business"],
        }),
    }),
});

export const { useAddLocationMutation } = addlocationApi;
