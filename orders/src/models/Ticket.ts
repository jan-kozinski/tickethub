import mongoose from "mongoose";
import { Order, OrderStatus } from "./Order";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

interface TicketAttrs {
  title: string;
  price: number;
  id?: string;
}
interface TicketModel extends mongoose.Model<TicketDoc> {
  build(attrs: TicketAttrs): TicketDoc;
  findByEvent(event: {
    id: string;
    version: number;
  }): Promise<TicketDoc | null>;
}
export interface TicketDoc extends mongoose.Document {
  version: number;
  title: string;
  price: number;
  isReserved(): Promise<boolean>;
}

const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
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

ticketSchema.set("versionKey", "version");
ticketSchema.plugin(updateIfCurrentPlugin);

ticketSchema.statics.build = (attrs: TicketAttrs) => {
  const isIdProvided = !!attrs.id;
  return isIdProvided
    ? new Ticket({
        _id: attrs.id,
        ...attrs,
        id: undefined,
      })
    : new Ticket(attrs);
};

ticketSchema.statics.findByEvent = async (event: {
  id: string;
  version: number;
}) =>
  await Ticket.findOne({
    _id: event.id,
    version: event.version - 1,
  });

ticketSchema.methods.isReserved = async function () {
  const existingOrder = await Order.findOne({
    ticket: this as any,
    status: {
      $in: [
        OrderStatus.Created,
        OrderStatus.AwaitingPayment,
        OrderStatus.Complete,
      ],
    },
  });

  return !!existingOrder;
};

const Ticket = mongoose.model<TicketDoc, TicketModel>("Ticket", ticketSchema);

export { Ticket };
