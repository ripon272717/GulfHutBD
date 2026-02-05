import { fetchBaseQuery, createApi } from '@reduxjs/toolkit/query/react';
import { BASE_URL } from '../constants';
import { logout } from './authSlice';

// ১. বেস কুয়েরি তৈরি
const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  credentials: 'include', 
});

// ২. অথেনটিকেশন চেক করার জন্য কাস্টম কুয়েরি
const baseQueryWithAuth = async (args, api, extra) => {
  const result = await baseQuery(args, api, extra);

  // যদি ৪০১ এরর আসে (লগইন নেই বা টোকেন নেই)
  if (result.error && result.error.status === 401) {
    api.dispatch(logout());
  }
  return result;
};

// ৩. এপিআই স্লাইস - এখানে আমরা baseQueryWithAuth ব্যবহার করছি
export const apiSlice = createApi({
  baseQuery: baseQueryWithAuth, // এই লাইনটিই ওয়ার্নিং রিমুভ করবে কারণ এখন এটা ব্যবহৃত হচ্ছে
  tagTypes: ['Product', 'Order', 'User'],
  endpoints: (builder) => ({}),
});