import {
  Publisher,
  OrderCancelledEvent,
  Subjects,
} from "@dzony12-tickethub/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
}
