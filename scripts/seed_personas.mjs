import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const prisma = new PrismaClient();

const data = [
    { ageGroup: 10, m1: '학업 중심 모범생', m2: '게임/스트리머 팬', f1: '아이돌/문구 덕후', f2: '숏폼/패션 얼리어답터' },
    { ageGroup: 20, m1: '취준생/갓생러', m2: '디지털 노마드/힙스터', f1: '사회초년생/자기계발', f2: '뷰티/전시회 매니아' },
    { ageGroup: 30, m1: '실용적 가장/직장인', m2: '테크/자동차 콜렉터', f1: '워킹맘/가족 중심', f2: '프리랜서/웰니스 라이프' },
    { ageGroup: 40, m1: '안정적 관리자', m2: '취미에 진심인 아재', f1: '교육열 높은 학부모', f2: '자기관리형 골드미스' },
    { ageGroup: 50, m1: '은퇴 준비 가장', m2: '프리미엄 레저족', f1: '내조/가족 안녕 중심', f2: '액티브 시니어/친목퀸' },
    { ageGroup: 60, m1: '전원생활/휴식형', m2: '스마트 디지털 시니어', f1: '손주 사랑/건강 중심', f2: '문화생활/여행 마니아' },
    { ageGroup: 70, m1: '보수적 노년층', m2: '봉사/사회참여형', f1: '평온한 가사 중심', f2: '소셜 네트워킹 시니어' },
    { ageGroup: 80, m1: '건강 관리 집중형', m2: '기록/회고형 어르신', f1: '정서적 교류 중심', f2: '예술/배움 열정형' }
];

// 1x1 투명 PNG 더미 이미지
const dummyPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mO88ODhfwAJjwPR91l9WQAAAABJRU5ErkJggg==', 'base64');

async function main() {
    const dir = path.join(__dirname, '../public/personas');
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    for (const row of data) {
        const age = row.ageGroup;
        const personas = [
            { gender: 'M', type: 1, name: row.m1 },
            { gender: 'M', type: 2, name: row.m2 },
            { gender: 'F', type: 1, name: row.f1 },
            { gender: 'F', type: 2, name: row.f2 },
        ];

        for (const p of personas) {
            const g = p.gender.toLowerCase();
            const imagePath = `/personas/ps_${age}_${g}_t${p.type}.png`;
            const fullPath = path.join(dir, `ps_${age}_${g}_t${p.type}.png`);

            // 실제 이미지가 없으면 더미 PNG 생성
            if (!fs.existsSync(fullPath)) {
                fs.writeFileSync(fullPath, dummyPng);
            }

            await prisma.persona.upsert({
                where: {
                    ageGroup_gender_type: {
                        ageGroup: age,
                        gender: p.gender,
                        type: p.type
                    }
                },
                update: {
                    name: p.name,
                    imagePath: imagePath
                },
                create: {
                    ageGroup: age,
                    gender: p.gender,
                    type: p.type,
                    name: p.name,
                    imagePath: imagePath
                }
            });
        }
    }
}

main()
    .then(() => {
        console.log("Seeding complete!");
        prisma.$disconnect();
    })
    .catch(e => {
        console.error(e);
        prisma.$disconnect();
        process.exit(1);
    });
