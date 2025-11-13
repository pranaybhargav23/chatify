import React from 'react'
import BorderAnimatedContainer from '../components/BorderAnimatedContainer.jsx';
import { useChatStore } from '../store/useChatStore';

import ProfileHeader from '../components/ProfileHeader.jsx';
import ActiveTabSwitch from '../components/ActiveTabSwitch.jsx';
import ChatsList from '../components/ChatsList.jsx';
import ContactsList from '../components/ContactsList.jsx';
import ChatContaier from '../components/ChatContaier.jsx';
import NoConversationPlaceHolder from '../components/NoConversationPlaceHolder.jsx';


function ChatPage() {
  const {activeTab,selectedUser} = useChatStore();
  return (
   <div className='relative w-full max-w-6xl h-[800px]'>
    <BorderAnimatedContainer>
     {/* LEFT CHAT */}
     <div className='w-80 bg-slate-800/50 backdrop-blur-sm flex flex-col'>
     <ProfileHeader />
     <ActiveTabSwitch />

     <div className='flex-1 overflow-y-auto p-4 space-y-2'>
        {activeTab === 'chats' ? <ChatsList /> : <ContactsList />}
     </div>

     </div>

      {/* RIGHT CHAT */}
      <div className='flex-1 flex flex-col bg-slate-900/50 backdrop-blur-sm'>
      {selectedUser ? <ChatContaier /> : <NoConversationPlaceHolder />}
         
      </div>

    </BorderAnimatedContainer>

   </div>
  )
}

export default ChatPage