import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { pool, useDemo, mockUsers } from "../config/db.js";
import { signToken } from "../utils/jwt.js";

export async function signup(req: Request, res: Response) {
  const { name, email, password } = req.body as {
    name?: string;
    email?: string;
    password?: string;
  };

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email and password are required" });
  }

  if (useDemo) {
    // Demo mode: check mock users
    if (mockUsers.has(email)) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const userId = uuidv4();
    const passwordHash = await bcrypt.hash(password, 10);
    mockUsers.set(email, { id: userId, name, email, passwordHash });

    const user = { id: userId, name, email };
    const token = signToken(user);
    return res.status(201).json({ token, user });
  }

  const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
  if (existing.rows.length > 0) {
    return res.status(409).json({ message: "Email already registered" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const result = await pool.query(
    `INSERT INTO users (name, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, name, email`,
    [name, email, passwordHash]
  );

  const user = result.rows[0];
  const token = signToken(user);

  return res.status(201).json({ token, user });
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body as {
    email?: string;
    password?: string;
  };

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  if (useDemo) {
    // Demo mode: check mock users
    const mockUser = mockUsers.get(email);
    if (!mockUser) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, mockUser.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = signToken({
      id: mockUser.id,
      email: mockUser.email,
      name: mockUser.name
    });

    return res.json({
      token,
      user: { id: mockUser.id, name: mockUser.name, email: mockUser.email }
    });
  }

  const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
  if (result.rows.length === 0) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const user = result.rows[0];
  if (!user.password_hash) {
    return res.status(401).json({ message: "Use Google login for this account" });
  }

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = signToken({
    id: user.id,
    email: user.email,
    name: user.name
  });

  return res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email }
  });
}
