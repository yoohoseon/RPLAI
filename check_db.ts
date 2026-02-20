
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
    try {
        const userCount = await prisma.user.count();
        const analysisCount = await prisma.brandAnalysis.count();

        console.log(`User Count: ${userCount}`);
        console.log(`BrandAnalysis Count: ${analysisCount}`);

        // Check one analysis if exists
        if (analysisCount > 0) {
            const first = await prisma.brandAnalysis.findFirst();
            console.log('First Analysis:', first);
        }
    } catch (e) {
        console.error('Error connecting to DB:', e);
    } finally {
        await prisma.$disconnect();
    }
}

check();
