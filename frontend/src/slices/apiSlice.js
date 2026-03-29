import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_URL } from '../constants';

const baseQuery = fetchBaseQuery({ 
  baseUrl: BASE_URL,
  // এই 'credentials: include' না থাকলে ব্রাউজার কুকি পাঠাবে না
  credentials: 'include', 
  prepareHeaders: (headers) => {
    // এখানে আলাদা করে টোকেন সেট করার দরকার নেই যেহেতু আমরা কুকি ব্যবহার করছি
    return headers;
  },
});

export const apiSlice = createApi({
  baseQuery,
  tagTypes: ['Product', 'Order', 'User'],
  endpoints: (builder) => ({}),
});