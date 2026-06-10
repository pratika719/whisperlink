import { userRepository } from "@/repositories/user.repository";
import { messageRepository } from "@/repositories/message.repository";

import { SendMessageInput } from "@/schemas/message.schema";

import {
  badRequest,
  notFound,
} from "@/lib/errors";


export const messageService={
    async sendMessage(
        data:SendMessageInput,
        senderId?:string
    ){
        const receiver=await userRepository.findByUsername(data.username);

        if(!receiver){
            throw notFound("Receiver not found")
        }

        if(senderId && senderId===receiver.id){
            throw badRequest("You cannot send message to yourself")
        }

        if(!receiver.acceptMessages){
            throw badRequest("Receiver is not accepting messages")
        }

          if (!receiver.isVerified) {
      throw badRequest(
        "User is not available"
      );
    }

 const content=data.content.trim();

 if(content.length<1){
    throw badRequest("Message cannot be empty");

 }

 const message =
      await messageRepository.create(
        receiver.id,
        content
      );

    return message;


},
};