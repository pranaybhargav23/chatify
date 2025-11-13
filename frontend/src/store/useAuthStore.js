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
        await axiosInstance.post('/auth/logout');
        set({authUser:null});
        toast.success("Logged out successfully!");
        get().disconnectSocket();
    }catch(err){
        toast.error(err.response?.data?.message || "Logout failed. Please try again.");

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

