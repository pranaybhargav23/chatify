import Message from "../models/message.js";
import User from "../models/User.js";
import cloudinary from "../lib/cloudinary.js";

export const getAllContacts = async (request, response) => {
    try {
        const loggedInUserId = request.user._id;
        const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select('-pasword');
        response.status(200).json(filteredUsers);
    } catch (err) {
        console.error(err);
        response.status(500).json({ message: 'Server Error' });
    }
}

export const getMessageByUserId = async (request, response) => {
    try {
        const myId = request.user._id;
        const { id: userToChatId } = request.params;

        //me and you
        // i send you the message
        // you send me the message

        const message = await Message.find({
            $or: [
                { senderId: myId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: myId }
            ]
        })
        response.status(200).json(message);
    } catch (err) {
        console.error(err);
        response.status(500).json({ message: 'Server Error' });
    }
}

export const sendMessage = async (request, response) => {
    try {
        const { text, image } = request.body;
        const { id: receiverId } = request.params;
        const senderId = request.user._id;

        let imageUrl = null;
        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl
        });
        await newMessage.save();

        //todo: send message to receiver using sockets

        response.status(201).json(newMessage);

    } catch (err) {
        console.error(err);
        response.status(500).json({ message: 'Server Error' });
    }
}

export const getChatPartners = async (request, response) => {
    try {
        const loggedInUserId = request.user._id;

        //find all the messages where loggedInUserId is either sender or receiver
        const messages = await Message.find({
            $or: [
                { senderId: loggedInUserId },
                { receiverId: loggedInUserId }
            ]
        });

        const chatPartnerIds = [
            ...new Set(messages.map(msg =>
                msg.senderId.toString() === loggedInUserId.toString() ? msg.receiverId.toString() : msg.senderId.toString()
            ))
        ]

        const chatPartners = await User.find({ _id: { $in: chatPartnerIds } }).select('-password');

        response.status(200).json(chatPartners);

    } catch (error) {
        console.error(error);
        response.status(500).json({ message: 'Server Error' });
    }
}