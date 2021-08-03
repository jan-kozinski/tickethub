import { Ticket } from "../Ticket";

it("implements optimistic concurttency control", async () => {
  const ticket = Ticket.build({
    title: "cocnert",
    price: 5,
    ownerId: "123",
  });

  await ticket.save();

  const firstInstance = await Ticket.findById(ticket.id);
  const secondInstance = await Ticket.findById(ticket.id);

  firstInstance!.set({ price: 10 });
  secondInstance!.set({ price: 15 });

  await firstInstance!.save();

  await expect(secondInstance!.save()).rejects.toThrow();
});

it("increments the version number on multiple saves", async () => {
  const ticket = Ticket.build({
    title: "cocnert",
    price: 5,
    ownerId: "123",
  });

  await ticket.save();
  expect(ticket.version).toEqual(0);
  ticket.set({ price: 10 });
  await ticket.save();

  const updatedTicket = await Ticket.findById(ticket.id);
  expect(updatedTicket!.version).toEqual(1);
});
