import {create} from 'zustand';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';


export const useAuthStore = create((set) => ({
   authUser: null,
   isCheckingAuth: true,
   isSigningUp: false,
   isloggingIn:false,

   checkAuth: async () =>{
         try {
            const response = await axiosInstance.get('/auth/check');
            set({authUser:response.data})
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
    }catch(err){
        toast.error(err.response?.data?.message || "Logout failed. Please try again.");

   }
}

}));

