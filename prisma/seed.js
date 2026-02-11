const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
    const hashedPassword = await bcrypt.hash('master123', 10)

    const master = await prisma.user.upsert({
        where: { email: 'master@rplai.com' },
        update: {},
        create: {
            email: 'master@rplai.com',
            name: 'Master Admin',
            password: hashedPassword,
            role: 'MASTER',
        },
    })

    console.log({ master })
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
