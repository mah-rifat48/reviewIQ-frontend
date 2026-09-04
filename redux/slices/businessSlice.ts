import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface BusinessState {
  selectedBusiness: string | null;
  selectedLocation: string | null;
  selectedAddress: string | null;
}

const initialState: BusinessState = {
  selectedBusiness: null,
  selectedLocation: null,
  selectedAddress: null,
};

const businessSlice = createSlice({
  name: "business",
  initialState,
  reducers: {
    setSelectedBusiness: (state, action: PayloadAction<string | null>) => {
      state.selectedBusiness = action.payload;
    },
    setSelectedLocation: (state, action: PayloadAction<string | null>) => {
      state.selectedLocation = action.payload;
    },
    setSelectedAddress: (state, action: PayloadAction<string | null>) => {
      state.selectedAddress = action.payload;
    },
  },
});

export const { setSelectedBusiness, setSelectedLocation, setSelectedAddress } = businessSlice.actions;
export default businessSlice.reducer;
