const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Starting seed...");

  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.users.create({
    data: {
      name: 'System Administrator',
      email: 'admin@dms.com',
      password: hashedPassword,
      role: 'admin',
    },
  });

  console.log("✅ Admin created:");
  console.log(admin);
}

main()
  .catch((e) => {
    console.error("❌ ERROR:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
