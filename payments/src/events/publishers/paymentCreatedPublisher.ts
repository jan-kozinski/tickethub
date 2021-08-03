import {
  Subjects,
  Publisher,
  PaymentCreatedEvent,
} from "@dzony12-tickethub/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
}
