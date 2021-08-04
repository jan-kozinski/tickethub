export const stripe = {
  charges: {
    create: jest.fn().mockResolvedValue({ id: "not-an-actual-id" }),
  },
};
