import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  userInfo: localStorage.getItem('userInfo')
    ? JSON.parse(localStorage.getItem('userInfo'))
    : null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.userInfo = action.payload;
      localStorage.setItem('userInfo', JSON.stringify(action.payload));
    },
    logout: (state) => {
      state.userInfo = null;
      localStorage.removeItem('userInfo');
      // চাইলে সব ক্লিয়ার করতে পারো: localStorage.clear();
    },
  },
});

// এগুলোই তোমার App.js, Header.jsx এবং অন্যান্য ফাইলে দরকার
export const { setCredentials, logout } = authSlice.actions;

export default authSlice.reducer;