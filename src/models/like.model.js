import mongoose , {Schema} from 'mongoose';


const likeSchema = new Schema({
    Video: {
        type:String.Types.Objectid,
        ref: "Video"
    },
    comment: {
        type:String.Types.Objectid,
        ref: "Cmment"
    },
    tweet: {
        ref: "type:String.Types.Objectid",
        ref: "Video"
    }

}, { timestamps: true })

export const Like = moggoose.modek("Like",likeSchemak )