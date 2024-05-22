import mongoose, {Schema} from "mongoose";

const subscriptionModel = new Schema({
    subscriber: {
        type: Schema.Types.ObjectId,// one who is subscribing
        ref: "User"
    },
    cahnnel: {
        type: Schema.Types.ObjectId,// one to whom subscriber is subscribing
        ref: "User"
    }
},  {
    timestamps: true
})

export const SubscriptionModel = mongoose.model("SubscriptionModel", subscriptionModel)