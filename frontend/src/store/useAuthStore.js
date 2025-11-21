import {create} from 'zustand';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

const BASE_URL = import.meta.env.MODE === "development" ? 'http://localhost:3000' : "";

export const useAuthStore = create((set, get) => ({
   authUser: null,
   isCheckingAuth: true,
   isSigningUp: false,
   isloggingIn:false,
   socket:null,
   onlineUsers:[],




   checkAuth: async () =>{
         try {
            const response = await axiosInstance.get('/auth/check');
            set({authUser:response.data})
            get().connectSocket();
            } catch (error) {
                console.log("Error checking auth:", error); 
                set({authUser:null})
            } finally {
                set({isCheckingAuth:false})
            }
   },

   signup: async(data) =>{
    set({isSigningUp:true});
    try {
        const response = await axiosInstance.post('/auth/signup',data);
        set({authUser:response.data});

        toast.success("Acoount created successfully!");
        get().connectSocket();
    } catch (error) {
        toast.error(error.response?.data?.message || "Signup failed. Please try again.");
    }finally{
        set({isSigningUp:false});
    }
   },


    login: async(data) =>{
    set({isloggingIn:true});
    try {
        const response = await axiosInstance.post('/auth/login',data);
        set({authUser:response.data});
       
        toast.success("logged in successfully!");
        
        get().connectSocket();

    } catch (error) {
        toast.error(error.response?.data?.message || "Signup failed. Please try again.");
    }finally{
        set({isloggingIn:false});
    }
   },

   logout: async() =>{
    try{
        // Clear auth user first to prevent further API calls
        set({authUser:null});
        
        // Disconnect socket immediately
        get().disconnectSocket();
        
        // Clear chat data to prevent stale state
        try {
            const { useChatStore } = await import('./useChatStore');
            useChatStore.getState().clearChatData();
        } catch (e) {
            // Ignore if chat store not available
        }
        
        // Make logout API call (this might fail but that's okay)
        await axiosInstance.post('/auth/logout');
        toast.success("Logged out successfully!");
    }catch(err){
        // Only show error if it's not a 401 (expected after clearing auth)
        if (err.response?.status !== 401) {
            toast.error(err.response?.data?.message || "Logout failed. Please try again.");
        } else {
            // Still show success even if logout API fails due to missing token
            toast.success("Logged out successfully!");
        }
   }
},

  updateProfile: async (data) => {
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("Error in update profile:", error);
      toast.error(error.response.data.message);
    }
  },


  connectSocket: () => {
    const  {authUser} = get();

    if(!authUser || get().socket) return;

    const socket = io(BASE_URL, {
        withCredentials:true
    })

    socket.connect();

    set({socket});

    // listen for online users
    socket.on("getOnlineUsers",(userIds) => {
        set({onlineUsers:userIds})
        });
  },

  disconnectSocket: () => {
    if(get().socket?.connected)get().socket?.disconnect();
  }



}));

