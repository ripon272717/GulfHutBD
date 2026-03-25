import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_URL } from '../constants';

const baseQuery = fetchBaseQuery({ 
  baseUrl: BASE_URL,
  // ব্রাউজার থেকে কুকি (Token) পাঠানোর জন্য নিচের এই লাইনটি বাধ্যতামূলক
  credentials: 'include', 
  prepareHeaders: (headers) => {
    return headers;
  },
});

export const apiSlice = createApi({
  baseQuery,
  tagTypes: ['Product', 'Order', 'User'],
  endpoints: (builder) => ({}),
});