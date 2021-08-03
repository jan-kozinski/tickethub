import express, { Request, Response } from "express";
import { body } from "express-validator";
import jwt from "jsonwebtoken";

import { BadRequestError, validateRequest } from "@dzony12-tickethub/common";
import { User } from "../models/User";
import { Password } from "../services/password";

const router = express.Router();

router.post(
  "/api/users/signin",
  [
    body("email").isEmail().withMessage("Email must be valid"),
    body("password")
      .trim()
      .notEmpty()
      .withMessage("You must supply a password"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (!existingUser) throw new BadRequestError("Invalid Credentials");

    const passwordsMatch = await Password.compare(
      existingUser.password,
      password
    );
    if (!passwordsMatch) throw new BadRequestError("Invalid Credentials");

    // Generate JWT
    const token = jwt.sign(
      {
        id: existingUser.id,
        email: existingUser.email,
      },
      process.env.JWT_SECRET!
    );

    //Store jwt on session object

    req.session = {
      ...req.session,
      jwt: token,
    };

    res.status(200).send(existingUser);
  }
);

export { router as signinRouter };
