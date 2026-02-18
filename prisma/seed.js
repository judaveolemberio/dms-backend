const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Starting seed...");

  const existingAdmin = await prisma.users.findUnique({
    where: { email: "admin@dms.com" }
  });

  if (existingAdmin) {
    console.log("✅ Admin already exists. Skipping...");
    return;
  }

  const hashedPassword = await bcrypt.hash('admin123', 10);

  await prisma.users.create({
    data: {
      name: "System Administrator",
      email: "admin@dms.com",
      password: hashedPassword,
      role: "admin"
    }
  });

  console.log("✅ Admin created successfully!");
}

main()
  .catch((e) => {
    console.error("❌ ERROR:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
