const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Cleaning up invalid analysis records...');

    // Find records with content "{}"
    const invalidRecords = await prisma.brandAnalysis.findMany({
        where: {
            content: "{}"
        }
    });

    console.log(`Found ${invalidRecords.length} invalid records.`);

    if (invalidRecords.length > 0) {
        const { count } = await prisma.brandAnalysis.deleteMany({
            where: {
                content: "{}"
            }
        });
        console.log(`Deleted ${count} invalid records.`);
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
