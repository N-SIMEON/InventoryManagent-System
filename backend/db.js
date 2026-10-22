require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({
  connectionString: process.env.APP_DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

module.exports = prisma;