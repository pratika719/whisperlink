import pino from "pino";

export const logger = pino({
    level:process.env.LOG_LEVEL || "info",
  base:{
    service:"whisperlink",
    environment:process.env.NODE_ENV,

  },
  timestamp:pino.stdTimeFunctions.isoTime,
  
});


