const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const count = await prisma.brandAnalysis.count();
    console.log(`Total BrandAnalysis records: ${count}`);
    const analyses = await prisma.brandAnalysis.findMany();
    console.log(analyses);
}

main()
    .catch(e => {
        throw e
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
