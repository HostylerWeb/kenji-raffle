import { config as loadEnv } from "dotenv";
import { resolve } from "path";
import bcrypt from "bcryptjs";
import { platformPrisma } from "../src/index";

loadEnv({ path: resolve(__dirname, "../../../.env") });

async function main() {
  const email = process.env.PLATFORM_SEED_EMAIL ?? "admin@platform.local";
  const password = process.env.PLATFORM_SEED_PASSWORD ?? "ChangeMe123!";
  const hash = await bcrypt.hash(password, 12);

  await platformPrisma.platform_users.upsert({
    where: { email },
    update: { password_hash: hash, role: "platform_admin" },
    create: {
      email,
      password_hash: hash,
      role: "platform_admin",
    },
  });

  console.log(`Platform admin seeded: ${email}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await platformPrisma.$disconnect();
  });
