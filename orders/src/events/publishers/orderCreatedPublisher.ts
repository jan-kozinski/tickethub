import {
  Publisher,
  OrderCreatedEvent,
  Subjects,
} from "@dzony12-tickethub/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
}
