import path from 'path';
import prisma from '../src/config/database.js';
import { seedApexDataset } from '../src/demo/apex-dataset.js';

async function main() {
  const companyId = process.argv[2];
  const workbookPath =
    process.argv[3] ??
    path.resolve(process.cwd(), '../db/apex_solutions_dataset.xlsx');

  if (!companyId) {
    throw new Error('Usage: npx tsx scripts/import-apex-dataset.ts <companyId> [workbookPath]');
  }

  await prisma.$connect();

  const summary = await seedApexDataset({
    companyId,
    workbookPath,
    includeUsers: false,
  });

  console.log(JSON.stringify({ companyId, workbookPath, summary }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
