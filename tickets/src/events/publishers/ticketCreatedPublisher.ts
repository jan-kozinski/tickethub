import {
  Publisher,
  Subjects,
  TicketCreatedEvent,
} from "@dzony12-tickethub/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
}
