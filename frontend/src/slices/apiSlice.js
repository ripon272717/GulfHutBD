import { fetchBaseQuery, createApi } from '@reduxjs/toolkit/query/react';
import { BASE_URL } from '../constants';
import { logout } from './authSlice';

// কাস্টম বেস কুয়েরি যেখানে credentials যোগ করা হয়েছে
const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  // এটি খুবই জরুরি: এটি ব্রাউজারকে বলে যেন রিকোয়েস্টের সাথে কুকি পাঠায়
  prepareHeaders: (headers) => {
    headers.set('credentials', 'include');
    return headers;
  },
  // আলাদা ডোমেইনের ক্ষেত্রে এটি অনেক সময় সরাসরি fetch অপশনেও দিতে হয়
  fetchFn: (input, init) => {
    return fetch(input, { ...init, credentials: 'include' });
  },
});

async function baseQueryWithAuth(args, api, extra) {
  const result = await baseQuery(args, api, extra);
  
  // যদি ব্যাকএন্ড থেকে 401 (Unauthorized) আসে, তবে ইউজারকে লগআউট করে দাও
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