import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_URL } from '../constants';

const baseQuery = fetchBaseQuery({ 
  baseUrl: BASE_URL,
  // ব্রাউজার থেকে অটোমেটিক কুকি (Credentials) পাঠানোর জন্য এটা দরকার
  prepareHeaders: (headers, { getState }) => {
    // যদি তোর কোনো আলাদা টোকেন লজিক থাকে তবে এখানে দিতে পারিস
    return headers;
  },
});

export const apiSlice = createApi({
  baseQuery,
  tagTypes: ['Product', 'Order', 'User'],
  endpoints: (builder) => ({}),
});