const asyncHandler = (requestHandler) => {
    return (req,res,next)=>{
        Promise.resolve(requestHandler(req, res, next))
        .catch((error) => next(error))
    }
}

export {asyncHandler};

//Try Catch async Handler
// const asyncHandler = (fn) => async (error, req, res, next) => {
//     try{
//         await fn(error, req, res, next)
//     }catch(error){
//         res.status(error.code || 500).json({
//             sucess: true,
//             message: error.message
//         })
//     }
// }
