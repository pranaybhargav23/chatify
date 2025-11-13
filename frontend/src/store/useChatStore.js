import {create } from 'zustand';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';
import { useAuthStore } from './useAuthStore';

const notificationSound = new Audio('/sounds/notification.mp3');

export const useChatStore = create((set,get) => ({
    allContacts: [],
    chats: [],
    messages : [],
    activeTab: 'chats',
    selectedUser: null,
    isUsersLoading: false,
    isChatsLoading: false,
    isMessagesLoading: false,
    isSoundEnabled: JSON.parse(localStorage.getItem('isSoundEnabled')) === true,
    

    toggleSound: () => {
        localStorage.setItem('isSoundEnabled', !get().isSoundEnabled);
        set({isSoundEnabled: !get().isSoundEnabled});
    },

    setActiveTab: (tab) => set({activeTab: tab}),

    setSelectedUser: (selectedUser) => set({selectedUser}),

    getAllContacts: async () => {
        set({isUsersLoading:true});
        try{
            const response = await axiosInstance.get("/messages/contacts");
            set({allContacts:response.data});

        }catch(err){
           toast.error(err.response?.data?.message || "Failed to load contacts. Please try again.");
        }finally{
            set({isUsersLoading:false});
        }
    },

    getMyChatPartners: async () => {
        set({isChatsLoading:true});
        try{
            const response = await axiosInstance.get("/messages/chats");
            set({chats:response.data});

        }catch(err){
              toast.error(err.response?.data?.message || "Failed to load chats. Please try again.");
        }finally{
            set({isChatsLoading:false});
        }
    },

    getMessagesByUserId: async (userId) => {

        set({isMessagesLoading:true});
        try {
            const response = await axiosInstance.get(`/messages/${userId}`);
            set({messages:response.data});
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to load messages. Please try again.");
        }finally{
            set({isMessagesLoading:false});
        }
    },

    sendMessage: async (messageData) => {
        const {selectedUser, messages} = get();
        const {authUser} = useAuthStore.getState();

        const tempId = `temp-${Date.now()}`;

        const optimisticMessage = {
            _id: tempId,
            senderId: authUser._id,
            receiverId: selectedUser._id,
            text: messageData.text || null,
            image: messageData.image || null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isOptimistic: true,

        };
        //immediately add the message to UI
        set({messages: [...messages, optimisticMessage]});
        try {
            const response = await axiosInstance.post(`/messages/send/${selectedUser._id}`,messageData);
            set({messages: messages.concat(response.data)});
            
        } catch (error) {
            //remove the optimistic message on failure
            set({messages:messages});
            toast.error(error.response?.data?.message || "Failed to send message. Please try again.");
        }
    },

    subscribeToMessages: () => {
        const{selectedUser, isSoundEnabled} = get();
        if(!selectedUser) return;

        const socket = useAuthStore.getState().socket;

        socket.on("newMessage", (newMessage) => {
            const currentMesages = get().messages;

            set({messages: [...currentMesages, newMessage]})
        
            if(isSoundEnabled){
                notificationSound.currentTime = 0;
                notificationSound.play().catch((e)=>console.log("Audio play failed:",e));
            }
        })
    },

    unsubcribeFromMessages: () => { 
        const socket = useAuthStore.getState().socket;
        socket.off("newMessage");
    }


   



}));