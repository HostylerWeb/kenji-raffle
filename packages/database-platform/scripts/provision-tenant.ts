import { config as loadEnv } from "dotenv";
import { resolve } from "path";
import { platformPrisma } from "../src/index";
import { provisionTenantForOperator } from "../src/provision-tenant";

loadEnv({ path: resolve(__dirname, "../../../.env") });

function parseArgs() {
  const args = process.argv.slice(2);
  const get = (flag: string) => {
    const idx = args.indexOf(flag);
    return idx >= 0 ? args[idx + 1] : undefined;
  };
  const slug = get("--slug");
  const graId = get("--gra-id");
  const name = get("--name");
  if (!slug || !graId || !name) {
    throw new Error(
      "Usage: provision:tenant -- --slug <slug> --gra-id <op-001> --name <Operator Name>",
    );
  }
  return { slug, graId, name };
}

async function main() {
  const { slug, graId, name } = parseArgs();

  const operator = await platformPrisma.operators.upsert({
    where: { slug },
    update: { name, gra_registry_id: graId, status: "onboarding" },
    create: {
      slug,
      name,
      gra_registry_id: graId,
      status: "onboarding",
      licence_number: graId,
    },
  });

  const result = await provisionTenantForOperator(operator.id);

  console.log(`Tenant provisioned: ${name}`);
  console.log(`  Operator id: ${result.operatorId}`);
  console.log(`  Database: ${result.databaseName}`);
  console.log(`  Hostname: ${result.hostname}`);
  console.log(`  Operator owner: ${result.ownerEmail} / ChangeMe123!`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await platformPrisma.$disconnect();
  });
