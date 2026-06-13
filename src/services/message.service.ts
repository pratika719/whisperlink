import { userRepository } from "@/repositories/user.repository";
import { messageRepository } from "@/repositories/message.repository";
import { aiService } from "@/services/ai.service";
import { aiUsageRepository } from "@/repositories/ai-usage.repository";
import { Sentiment } from "@/generated/prisma/client";

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

  // AI Analysis (Production Grade feature with rate-limiting)
  // Analyze the sentiment of the message before storing it, if the receiver's limit allows it.
  let sentimentResult: { sentiment: Sentiment; score: number } | undefined = undefined;
  try {
    const { allowed } = await aiUsageRepository.canUseAnalysis(receiver.id);
    if (allowed) {
      sentimentResult = await aiService.analyzeSentiment(content);
      await aiUsageRepository.incrementAnalysis(receiver.id);
    }
  } catch (error) {
    console.error("AI Sentiment Analysis rate-limiting check or call failed:", error);
  }

  const message =
       await messageRepository.create(
         receiver.id,
         content,
         senderId,
         sentimentResult?.sentiment,
         sentimentResult?.score
       );

    return message;


},
};