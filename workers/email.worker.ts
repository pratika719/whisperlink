import {Worker,Job} from  "bullmq"
import type { EmailJob }  from "@/lib/jobs/email.jobs"
import {sendVerificationEmail} from "@/services/email.service"

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  throw new Error("REDIS_URL is missing");
}


export const emailWorker=new Worker<EmailJob>(
  "email-queue",
  async(job)=>{
    switch(job.data.type){
        case "SEND_OTP_EMAIL":
            await sendVerificationEmail(
                job.data.payload.to,
                job.data.payload.otp
            );
            break;
          default:
        throw new Error("Unknown email job type");
            
    }

    
  },
  {
    connection:{
        url:redisUrl,
    },
    concurrency:5,

  }
);

emailWorker.on("completed",(job)=>{
    console.log({
        event:"email_job_completed",
        jobId:job.id,
    })
});

emailWorker.on("failed",(job,error)=>{
    console.log({
        event:"email_job_failed",
        jobId:job?.id,
        error:error.message,
        
    });
});

emailWorker.on("error", (error) => {
  console.error({
    event: "bullmq_worker_error",
    queue: "email-queue",
    error: error.message,
    stack: error.stack,
  });
});

console.log({
  event: "email_worker_started",
  queue: "email-queue",
});


