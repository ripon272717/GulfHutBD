import { apiSlice } from './apiSlice';
import { USERS_URL, UPLOAD_URL } from '../constants';

export const usersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/auth`,
        method: 'POST',
        body: data,
      }),
    }),
    register: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}`,
        method: 'POST',
        body: data,
      }),
    }),
    logout: builder.mutation({
      query: () => ({
        url: `${USERS_URL}/logout`,
        method: 'POST',
      }),
    }),
    // এই মিউটেশন প্রোফাইল পিকচারসহ সব ডাটা আপডেট করবে
    profile: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/profile`,
        method: 'PUT',
        body: data,
      }),
    }),
    getUsers: builder.query({
      query: () => ({ url: USERS_URL }),
      providesTags: ['User'],
      keepUnusedDataFor: 5,
    }),
    deleteUser: builder.mutation({
      query: (userId) => ({
        url: `${USERS_URL}/${userId}`,
        method: 'DELETE',
      }),
    }),
    getUserDetails: builder.query({
      query: (id) => ({ url: `${USERS_URL}/${id}` }),
      keepUnusedDataFor: 5,
    }),
    updateUser: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/${data.userId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    updateUserBalance: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/${data.userId}/balance`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    // এই মিউটেশনটি ছবি ক্লাউডিনারিতে পাঠাবে
    uploadUserImage: builder.mutation({
      query: (data) => ({
        url: `${UPLOAD_URL}`, 
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useRegisterMutation,
  useProfileMutation,
  useGetUsersQuery,
  useDeleteUserMutation,
  useUpdateUserMutation,
  useGetUserDetailsQuery,
  useUpdateUserBalanceMutation,
  useUploadUserImageMutation, 
} = usersApiSlice;