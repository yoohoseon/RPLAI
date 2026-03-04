const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const categories = [
        "생활용품", "여행 및 숙박 서비스", "음.식료품", "통신기기", "애완용품", "농축수산물", "패션용품 및 액세서리",
        "아동, 유아용품", "사무, 문구", "뷰티", "스포츠, 레저용품", "문화 및 레저 서비스", "자동차 및 자동차 용품",
        "제약, 의료용품", "제약, 의료 서비스", "서적", "가구", "컴퓨터 및 주변 기기", "가전, 전자", "음식 서비스",
        "앱 및 플랫폼 서비스", "B2B 서비스", "B2B 제조용품", "금융상품 및 서비스", "공연 예술, 문화 서비스", "코스메틱"
    ];

    for (let i = 0; i < categories.length; i++) {
        await prisma.brandCategory.upsert({
            where: { name: categories[i] },
            update: { sortOrder: i },
            create: { name: categories[i], sortOrder: i }
        });
    }
    console.log("Categories seeded!");
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
