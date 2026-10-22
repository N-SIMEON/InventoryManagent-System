require("dotenv").config();
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("./db");

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 4000;

function signToken(userId, tenantId, role) {
  return jwt.sign({ userId, tenantId, role }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
}

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/signup", async (req, res) => {
  try {
    const { email, password, companyName } = req.body || {};
    if (!email || !password || !companyName) {
      return res.status(400).json({ error: "email, password and companyName are required" });
    }
    const normalizedEmail = email.trim().toLowerCase();

    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return res.status(409).json({ error: "email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const tenant = await prisma.tenant.create({
      data: {
        name: companyName,
        memberships: {
          create: {
            role: "owner",
            user: { create: { email: normalizedEmail, passwordHash } },
          },
        },
      },
      include: { memberships: true },
    });

    const membership = tenant.memberships[0];
    const token = signToken(membership.userId, tenant.id, membership.role);
    res.status(201).json({ token, tenantId: tenant.id, role: membership.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal error" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      include: { memberships: true },
    });
    const valid = user && (await bcrypt.compare(password, user.passwordHash));
    if (!valid || user.memberships.length === 0) {
      return res.status(401).json({ error: "invalid credentials" });
    }

    const membership = user.memberships[0];
    const token = signToken(user.id, membership.tenantId, membership.role);
    res.json({ token, tenantId: membership.tenantId, role: membership.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal error" });
  }
});

app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});