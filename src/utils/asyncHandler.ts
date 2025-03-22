import { Request, Response, NextFunction } from "express";
const asyncHandler = (requestHandler:any) => {
    return (req:Request,res:Response,next:NextFunction) => {
        Promise.resolve(requestHandler(req,res,next)).catch((e)=> next(e))
    }
}

export {asyncHandler};

// const asyncHandler = (fn) => async (req,res,next) => {
//     try
//     {
//         await fn(req,res,next);
//     }
//     catch(e)
//     {
//         res.status(e.code || 500).json({
//             success: false,
//             message: e.message
//         })
//     }
// }