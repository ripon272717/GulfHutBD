import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_URL } from '../constants';

const baseQuery = fetchBaseQuery({ 
  baseUrl: BASE_URL,
  // যদি তোমার কোনো টোকেন বা অথেন্টিকেশন লাগে তবে এখানে যোগ করতে পারো
});

export const apiSlice = createApi({
  baseQuery,
  tagTypes: ['Product', 'Order', 'User'],
  endpoints: (builder) => ({}),
});