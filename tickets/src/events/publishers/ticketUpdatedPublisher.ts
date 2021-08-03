import {
  Publisher,
  Subjects,
  TicketUpdatedEvent,
} from "@dzony12-tickethub/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
}
