import {NextRequest} from "next/server";
import { LoginSchema } from "@/schemas/auth.schema";
import { authService } from "@/services/auth.service";
import {
    errorResponse,
    successResponse,
} from "@/lib/route-handler";

import { setSessionCookie } from "@/lib/auth/cookies";

export async function POST(req: NextRequest) {
    try{
        const body=await req.json();
        const result=LoginSchema.safeParse(body);

        if(!result.success){
            return Response.json({
                success:false,
                error:result.error.flatten()
            },{
                status:400,
            });
        }

        const loginResult=await authService.login(result.data);

        await setSessionCookie(loginResult.token);

        return successResponse({
            user:loginResult.user,
            message:"Login successfully"
        })

    }catch(err){
        console.log("Login error:",err);
        return errorResponse(err);

    }

}
//call servicelayer
//set cookie






        
