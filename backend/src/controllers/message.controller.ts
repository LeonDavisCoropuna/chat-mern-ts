import { Response } from "express";
import Conversation from "../models/conversation.model";
import Message from "../models/message.model";
import { IGetUserAuthInfoRequest } from "../types/express";
import { getReciverSocketId, io } from "../../socket/socket";

export const sendMessage = async (
  req: IGetUserAuthInfoRequest,
  res: Response
) => {
  try {
    const { message } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user?._id || "";

    let conversation = await Conversation.findOne({
      participants: {
        $all: [senderId, receiverId],
      },
    });
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
      });
    }
    const newMessage = new Message({
      senderId,
      receiverId,
      message,
    });
    if (newMessage) {
      conversation.messages.push(newMessage._id);
    }
    //await conversation.save();
    //await newMessage.save();
    await Promise.all([conversation.save(), newMessage.save()]);

    const receiverSocketId = getReciverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    return res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (
  req: IGetUserAuthInfoRequest,
  res: Response
) => {
  try {
    const { id: userToChatId } = req.params;
    const senderId = req.user?._id || "";
    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, userToChatId] },
    }).populate("messages");

    if (!conversation) return res.status(200).json([]);
    const messages = conversation.messages;
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
