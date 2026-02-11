const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const userId = 'cmleug0oq000jkg1flchs9qsr'; // User ID from logs

const analysisData = {
    kpis: [
        { label: 'Brand Awareness', value: 'High', trend: 'up', change: '+12%', description: 'Strong market presence' },
        { label: 'Engagement Rate', value: '4.5%', trend: 'neutral', change: '0%', description: 'Steady customer interaction' },
        { label: 'Sentiment Score', value: 'Positive', trend: 'up', change: '+5%', description: 'Favorable customer reviews' },
        { label: 'Conversion Rate', value: '3.2%', trend: 'down', change: '-1%', description: 'Slight dip in conversions' }
    ],
    insight: {
        intent: 'Premium and effective skincare brand',
        perception: 'Reliable but slightly expensive',
        gap: 'Price point friction despite quality recognition'
    },
    strategy: [
        { category: 'Strengths', points: ['High quality ingredients', 'Strong brand heritage'] },
        { category: 'Weaknesses', points: ['High price point', 'Limited global reach'] },
        { category: 'Opportunities', points: ['Expansion into Southeast Asia', 'Eco-friendly packaging'] },
        { category: 'Threats', points: ['Emerging indie brands', 'Economic downturn'] }
    ],
    actions: [
        { phase: 'Phase 1', title: 'Digital Campaign', description: 'Launch targeted social media ads', timeline: 'Q3 2024' },
        { phase: 'Phase 2', title: 'Loyalty Program', description: 'Revamp rewards for repeat customers', timeline: 'Q4 2024' },
        { phase: 'Phase 3', title: 'Global Expansion', description: 'Enter 2 new international markets', timeline: '2025' }
    ],
    sentiments: [
        { category: 'positive', text: "Love the texture and smell!", source: 'Instagram' },
        { category: 'positive', text: "Really helped with my dry skin.", source: 'Website Review' },
        { category: 'negative', text: "Too expensive for daily use.", source: 'Twitter' },
        { category: 'negative', text: "Shipping was slow.", source: 'Facebook' }
    ]
};

async function main() {
    console.log('Seeding database for user:', userId);

    // Delete existing analysis for clean state if needed (optional)
    // await prisma.brandAnalysis.deleteMany({ where: { userId } }); 

    const result = await prisma.brandAnalysis.create({
        data: {
            brand: 'ahc',
            category: 'beauty',
            target: '2030',
            competitors: '주름개선', // from logs
            url: 'https://www.naver.com', // from logs
            content: JSON.stringify(analysisData),
            userId: userId
        }
    });

    console.log('Created analysis record:', result.id);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
