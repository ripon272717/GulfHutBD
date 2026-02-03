import { fetchBaseQuery, createApi } from '@reduxjs/toolkit/query/react';
import { BASE_URL } from '../constants';
import { logout } from './authSlice';

// fetchBaseQuery কনফিগারেশন
const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  // এটিই সবচেয়ে গুরুত্বপূর্ণ লাইন যা ভার্সেল থেকে রেন্ডারে কুকি পাঠাতে বাধ্য করবে
  credentials: 'include', 
});

async function baseQueryWithAuth(args, api, extra) {
  const result = await baseQuery(args, api, extra);

  // যদি ব্যাকএন্ড থেকে 401 Unauthorized এরর আসে, তার মানে ইউজার লগইন নেই
  if (result.error && result.error.status === 401) {
    api.dispatch(logout());
  }
  return result;
}

export const apiSlice = createApi({
  baseQuery: baseQueryWithAuth,
  tagTypes: ['Product', 'Order', 'User'],
  endpoints: (builder) => ({}),
});