const { createSlice } = require("@reduxjs/toolkit");

const initialState = {
  selectedContact: null,
};

export const contactSlice = createSlice({
  name: "contacts",
  initialState,
  reducers: {
    updateSelectedContact: (state, action) => {
      state.selectedContact = action?.payload;
    },
    resetSelectedContact: (state, action) => {
      state = initialState;
    },
  },
});

export const { updateSelectedContact, resetSelectedContact } = contactSlice.actions;
export default contactSlice.reducer;
