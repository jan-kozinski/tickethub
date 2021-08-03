import express, { Request, Response } from "express";
import { body } from "express-validator";
import jwt from "jsonwebtoken";

import { BadRequestError, validateRequest } from "@dzony12-tickethub/common";
import { User } from "../models/User";

const router = express.Router();

router.post(
  "/api/users/signup",
  [
    body("email").isEmail().withMessage("Email must be valid"),
    body("password")
      .trim()
      .isLength({ min: 8, max: 32 })
      .withMessage("Password must be between 8 and 32 characters"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const userAlreadyExists = !!(await User.findOne({ email }));

    if (userAlreadyExists) {
      throw new BadRequestError("E-mail already in use");
    }

    const newUser = User.build({ email, password });
    await newUser.save();

    // Generate JWT
    const token = jwt.sign(
      {
        id: newUser.id,
        email: newUser.email,
      },
      process.env.JWT_SECRET!
    );

    //Store jwt on session object

    req.session = {
      ...req.session,
      jwt: token,
    };

    res.status(201).send(newUser);
  }
);

export { router as signupRouter };
