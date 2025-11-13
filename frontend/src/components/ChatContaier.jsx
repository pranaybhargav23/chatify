import React, { useEffect, useRef } from "react";
import { useChatStore } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import { useAuthStore } from "../store/useAuthStore";
import NoChatHistoryPlaceholder from "./NoChatHistoryPlaceholder";
import MessagesLoadingSkeleton from "./MessagesLoadingSkeleton";
import MessageInput from "./MessageInput";

function ChatContainer() {
  const { selectedUser, getMessagesByUserId, messages,isMessagesLoading,subscribeToMessages,unsubcribeFromMessages } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  useEffect(() => {
    getMessagesByUserId(selectedUser._id);
    subscribeToMessages();

    return () => {
      unsubcribeFromMessages();
    }
  }, [selectedUser._id, getMessagesByUserId,subscribeToMessages,unsubcribeFromMessages]);


  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  

  return (
    <>
      <ChatHeader />
      <div className="flex-1 px-6 overflow-y-auto py-8">
        {messages.length > 0  && !isMessagesLoading? (
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((msg) => {
              const isOwnMessage = msg.senderId === authUser?.user?._id;
              return (
                <div
                  key={msg._id}
                  className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                      isOwnMessage
                        ? "bg-cyan-600 text-white rounded-br-none"
                        : "bg-slate-700 text-slate-200 rounded-bl-none"
                    } shadow-lg`}
                  >
                    {msg.image && (
                      <img
                        src={msg.image}
                        alt="Shared"
                        className="rounded-lg max-w-full h-auto mb-2"
                      />
                    )}
                    {msg.text && (
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                    )}
                    <div className={`text-xs mt-1 opacity-75 ${isOwnMessage ? "text-right" : "text-left"}`}>
                      {new Date(msg.createdAt).toLocaleTimeString(undefined, {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
            {/* 👇 scroll target */}
            <div ref={messageEndRef} />
          </div>
        ) : isMessagesLoading ? <MessagesLoadingSkeleton /> : (
          <NoChatHistoryPlaceholder name={selectedUser.fullName} />
        )}
      </div>

    <MessageInput />
    </>
  );
}

export default ChatContainer;
