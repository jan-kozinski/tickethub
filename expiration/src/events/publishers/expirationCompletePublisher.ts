import {
  Subjects,
  Publisher,
  ExpirationCompleteEvent,
} from "@dzony12-tickethub/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
}
