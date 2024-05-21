import {Router} from 'express';
import { registerUser } from '../controllers/user.controller.js';
import { upload } from "../middlewares/multer.middleware.js";
const router = Router()

router.route("/register").post(
    //Inject middleware befor run register user file 
    //middlerware validate user file input filed using multer libraray
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
    )

export default router