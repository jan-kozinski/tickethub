import { OrderStatus } from "@dzony12-tickethub/common";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";
import mongoose from "mongoose";

interface OrderAttrs {
  id: string;
  version: number;
  userId: string;
  status: OrderStatus;
  price: number;
}
interface OrderDoc extends mongoose.Document {
  version: number;
  userId: string;
  status: OrderStatus;
  price: number;
}
interface OrderModel extends mongoose.Model<OrderDoc> {
  build(attrs: OrderAttrs): OrderDoc;
}

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

orderSchema.set("versionKey", "version");
orderSchema.plugin(updateIfCurrentPlugin);

orderSchema.statics.build = (attrs: OrderAttrs) => {
  return new Order({ ...attrs, id: undefined, _id: attrs.id });
};

const Order = mongoose.model<OrderDoc, OrderModel>("Order", orderSchema);
export { Order };
