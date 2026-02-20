
import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('Start seeding ...')

    // Clean up existing data to ensure clean slate
    try {
        await prisma.brandAnalysis.deleteMany()
        await prisma.user.deleteMany()
        await prisma.team.deleteMany()
        console.log('Cleaned up database.')
    } catch (e) {
        console.warn('Cleanup failed (maybe empty DB), continuing...', e)
    }

    const teamNames = ['BM-C', 'BM-P', 'BM-M', 'SM-I', 'SM-D', 'SM-G', 'SM-E']
    const password = await hash('password123', 12)

    // Create MASTER user (independent, no team)
    const master = await prisma.user.create({
        data: {
            email: 'master@example.com',
            name: 'Master User',
            password,
            role: 'MASTER',
        }
    })
    console.log('Created Master:', master.email)

    for (const teamName of teamNames) {
        // Create Team
        const team = await prisma.team.create({
            data: {
                name: teamName,
                description: `${teamName} Team`,
            }
        })

        // Create Team Leader
        // Email format: leader_bmc@example.com
        const leaderEmail = `leader_${teamName.toLowerCase().replace('-', '')}@example.com`
        const leader = await prisma.user.create({
            data: {
                email: leaderEmail,
                name: `${teamName} Leader`,
                password,
                role: 'TEAM_LEADER',
                teamId: team.id,
            }
        })
        console.log(`Created Leader for ${teamName}:`, leader.email)

        // Create 3 Team Members
        // Email format: member_bmc_1@example.com
        for (let i = 1; i <= 3; i++) {
            const memberEmail = `member_${teamName.toLowerCase().replace('-', '')}_${i}@example.com`
            await prisma.user.create({
                data: {
                    email: memberEmail,
                    name: `${teamName} Member ${i}`,
                    password,
                    role: 'TEAM_MEMBER',
                    teamId: team.id,
                }
            })
        }
        console.log(`Created 3 Members for ${teamName}`)
    }

    // Add sample analyses
    // Assign to a random leader or member
    const randomUser = await prisma.user.findFirst({ where: { role: 'TEAM_MEMBER' } })

    if (randomUser) {
        // 1. Samsung (Existing)
        await prisma.brandAnalysis.create({
            data: {
                brandKor: '삼성전자',
                brandEng: 'Samsung Electronics',
                url: 'https://samsung.com',
                socialUrls: JSON.stringify({
                    instagram: 'https://instagram.com/samsung',
                    youtube: 'https://youtube.com/samsung'
                }),
                category: 'Electronics',
                target: 'Global Consumers',
                competitors: 'Apple, LG',
                content: JSON.stringify({
                    kpis: [
                        { label: "Market Share", value: "20%", trend: "up", change: "+2%", description: "글로벌 스마트폰 시장 점유율 1위 유지" },
                        { label: "NPS", value: "72", trend: "up", change: "+5", description: "순 추천 지수 (고객 충성도 지표)" },
                        { label: "Brand Recall", value: "85%", trend: "neutral", change: "0%", description: "최초 상기도 (Top of Mind Awareness)" },
                        { label: "Online Sentiment", value: "Positive", trend: "up", change: "+10%", description: "소셜 미디어 내 긍정 여론 증가" }
                    ],
                    insight: {
                        intent: "AI와 연결성을 선도하는 혁신적 리더",
                        perception: "신뢰할 수 있는 하드웨어 제조사, 소프트웨어 경험 개선 중",
                        gap: "일부 세대(Gen Z)에서 애플 대비 덜 프리미엄하다는 인식"
                    },
                    strategy: [
                        { category: "Strengths", points: ["글로벌 공급망 및 제조 역량", "강력한 브랜드 자산 및 인지도", "폴더블폰 등 하드웨어 기술 리더십"] },
                        { category: "Weaknesses", points: ["하드웨어 매출 의존도가 높음", "프리미엄 시장에서의 브랜드 선호도 열세"] },
                        { category: "Opportunities", points: ["모든 기기에 AI(Galaxy AI) 통합", "6G 표준 기술 선점"] },
                        { category: "Threats", points: ["지정학적 긴장 및 공급망 이슈", "중국 브랜드의 저가 공세 및 기술 추격"] }
                    ],
                    actions: [
                        { phase: "Phase 1", title: "AI Integration", description: "갤럭시 AI 기능을 중저가 라인업까지 확대 적용", timeline: "2024년 3분기" },
                        { phase: "Phase 2", title: "Ecosystem Lock-in", description: "기기 간 연결성(Continuity) 강화로 락인 효과 증대", timeline: "2024년 4분기" },
                        { phase: "Phase 3", title: "Premium Shift", description: "초프리미엄 폴더블 라인업 출시로 이미지 제고", timeline: "2025년" }
                    ],
                    sentiments: [
                        { category: "positive", text: "이번 갤럭시 신제품의 AI 기능이 정말 놀랍습니다.", source: "Twitter" },
                        { category: "positive", text: "카메라 성능이 눈에 띄게 좋아졌네요.", source: "Reddit" },
                        { category: "negative", text: "배터리 수명이 좀 더 길었으면 좋겠습니다.", source: "Review" },
                        { category: "negative", text: "기본 설치된 앱이 너무 많아 불편합니다.", source: "Forum" }
                    ]
                }),
                userId: randomUser.id,
            },
        })

        // 2. Goldenax (Requested Sample)
        await prisma.brandAnalysis.create({
            data: {
                brandKor: '골드넥스',
                brandEng: 'Goldenax',
                url: 'https://www.goldenax.co.kr/',
                socialUrls: JSON.stringify({}),
                category: '광고대행사',
                target: '3040',
                competitors: '광고대행, 크리에이티브',
                content: JSON.stringify({
                    kpis: [
                        { label: "Client Retention", value: "High", trend: "up", change: "Stable", description: "매일유업, SPC 등 주요 브랜드와의 장기 파트너십 구축" },
                        { label: "Business Areas", value: "4+", trend: "up", change: "Red Penguin, Studio RP", description: "마케팅, 프로덕션, IP 등 사업 포트폴리오 다각화" },
                        { label: "Creative Impact", value: "Strong", trend: "up", change: "Viral", description: "SNS 캠페인 및 콘텐츠의 높은 도달률과 참여도" },
                        { label: "Growth", value: "Steady", trend: "up", change: "+", description: "서비스 범위의 지속적인 확장 및 안정적 성장" }
                    ],
                    insight: {
                        intent: "Be Your Color, Connect through Content",
                        perception: "자체 제작 역량(Studio RP)을 갖춘 다재다능한 '마케팅 컨설턴시'",
                        gap: "'크리에이티브 대행사'와 전략적 '컨설턴시' 사이의 이미지 균형 필요"
                    },
                    strategy: [
                        { category: "Strengths", points: ["인하우스 원스톱 솔루션 (Studio RP, 레드펭귄)", "강력한 자체 콘텐츠 IP (소셜마케팅코리아)", "F&B 대기업(하인즈, 매일유업 등)과의 성공적인 레퍼런스"] },
                        { category: "Weaknesses", points: ["'테크/데이터' 기반 역량에 대한 인지도 강화 필요", "특정 산업군(F&B)에 대한 높은 의존도"] },
                        { category: "Opportunities", points: ["글로벌 마케팅 지원 사업 확장", "'소셜마케팅코리아'를 활용한 B2B 리드 생성 강화"] },
                        { category: "Threats", points: ["경쟁사들의 빠른 AI 기술 도입", "디지털 광고 시장의 포화 및 경쟁 심화"] }
                    ],
                    actions: [
                        { phase: "Phase 1", title: "Brand Identity", description: "성공 사례(Case Studies)를 통해 '컨설턴시'로서의 포지셔닝 강화", timeline: "2024년 3분기" },
                        { phase: "Phase 2", title: "IP Expansion", description: "'레드펭귄' 캐릭터 비즈니스 및 세계관 확장", timeline: "2024년 4분기" },
                        { phase: "Phase 3", title: "Tech Integration", description: "콘텐츠 제작 효율화를 위한 내부 AI 툴 도입 및 프로세스 최적화", timeline: "2025년" }
                    ],
                    sentiments: [
                        { category: "positive", text: "콘텐츠 퀄리티가 탁월합니다. (Studio RP)", source: "고객사 피드백" },
                        { category: "positive", text: "소셜마케팅코리아의 트렌드 리포트가 매우 유용해요.", source: "업계 블로그" },
                        { category: "negative", text: "프로젝트 일정이 다소 빠듯하게 진행되었습니다.", source: "내부 리뷰" },
                        { category: "neutral", text: "다양한 사업을 전개하고 있어 핵심 역량이 무엇인지 헷갈릴 때가 있음.", source: "시장 반응" }
                    ]
                }),
                userId: randomUser.id,
            },
        })

        // 3. AHC (Requested Sample)
        await prisma.brandAnalysis.create({
            data: {
                brandKor: 'AHC',
                brandEng: 'Aesthetic Hydration Cosmetics',
                url: 'https://www.ahc.co.kr/',
                socialUrls: JSON.stringify({
                    instagram: 'https://www.instagram.com/ahc.official',
                    youtube: 'https://www.youtube.com/user/ahcservice'
                }),
                category: 'Cosmetics',
                target: '2050 Women',
                competitors: '가히(KAHI), 닥터지(Dr.G), 아이오페',
                content: JSON.stringify({
                    kpis: [
                        { label: "Hero Product Sales", value: "1.2억+", trend: "up", change: "Steady", description: "'아이크림 포 페이스' 시리즈 누적 판매량" },
                        { label: "Global Reach", value: "High", trend: "up", change: "Expansion", description: "중국 광군제 등 글로벌 시장 성과" },
                        { label: "Brand Awareness", value: "90%", trend: "neutral", change: "Stable", description: "홈쇼핑 및 올리브영 채널을 통한 높은 인지도" },
                        { label: "Derm-Science", value: "Focus", trend: "up", change: "Rebranding", description: "전문적 더마 코스메틱 이미지 강화 중" }
                    ],
                    insight: {
                        intent: "에스테틱 노하우를 바탕으로 한 '프로페셔널 더마 스킨케어'",
                        perception: "가성비 좋은 '국민 아이크림' 브랜드, 홈쇼핑 화장품",
                        gap: "고기능성 '더마' 브랜드로서의 프리미엄 인식 부족"
                    },
                    strategy: [
                        { category: "Strengths", points: ["압도적인 히트 상품 보유(아이크림)", "강력한 홈쇼핑/H&B 채널 장악력", "유니레버의 글로벌 네트워크"] },
                        { category: "Weaknesses", points: ["저가/할인 중심의 브랜드 이미지", "아이크림 외 카테고리의 파워 상대적 약세"] },
                        { category: "Opportunities", points: ["슬로우 에이징 트렌드에 맞춘 '더마' 포지셔닝 강화", "글로벌 앰버서더(K-Star) 활용한 해외 확장"] },
                        { category: "Threats", points: ["인디 브랜드들의 H&B 시장 공세", "홈쇼핑 채널의 성장 둔화"] }
                    ],
                    actions: [
                        { phase: "Phase 1", title: "Rebranding", description: "'더마 사이언스' 아이덴티티 확립 및 비주얼 리뉴얼", timeline: "2024년" },
                        { phase: "Phase 2", title: "Category Expansion", description: "선케어, 세럼 등 '아이크림' 외 히트 상품 육성", timeline: "2025년 상반기" },
                        { phase: "Phase 3", title: "Global Premium", description: "북미/유럽 시장 내 프레스티지 채널 진입", timeline: "2025년 하반기" }
                    ],
                    sentiments: [
                        { category: "positive", text: "아이크림은 역시 AHC가 최고예요. 얼굴 전체에 바르니 너무 편해요.", source: "올리브영 리뷰" },
                        { category: "positive", text: "가성비가 좋아서 부담 없이 듬뿍 바를 수 있어 좋습니다.", source: "화해" },
                        { category: "negative", text: "너무 홈쇼핑 이미지가 강해서 선물하기엔 좀 그래요.", source: "커뮤니티" },
                        { category: "negative", text: "제품 라인업이 너무 많고 복잡해서 뭘 사야 할지 모르겠어요.", source: "블로그" }
                    ]
                }),
                userId: randomUser.id,
            },
        })

        // 4. Kindo (Requested Sample)
        await prisma.brandAnalysis.create({
            data: {
                brandKor: '킨도',
                brandEng: 'Kindoh',
                url: 'https://kindoh.co.kr/',
                socialUrls: JSON.stringify({
                    instagram: 'https://www.instagram.com/kindoh_official',
                    blog: 'https://blog.naver.com/kindoh_official'
                }),
                category: 'Baby Care',
                target: '3040 Parents',
                competitors: '하기스(Huggies), 팸퍼스(Pampers), 페넬로페',
                content: JSON.stringify({
                    kpis: [
                        { label: "Safety Rating", value: "Top Tier", trend: "up", change: "Certified", description: "오코텍스 1등급 및 더마테스트 엑설런트 5스타 획득" },
                        { label: "Repurchase Rate", value: "High", trend: "up", change: "Loaylty", description: "제품 안전성에 대한 신뢰로 높은 재구매율 보유" },
                        { label: "Premium Pos.", value: "Luxury", trend: "neutral", change: "Steady", description: "프리미엄 기저귀 시장 내 확고한 입지" },
                        { label: "Lineup Exp.", value: "Active", trend: "up", change: "New", description: "오슬림(O-Slim) 등 다양한 라인업 확장 중" }
                    ],
                    insight: {
                        intent: "아기의 안전과 편안함을 최우선으로 하는 '정직한 기저귀'",
                        perception: "믿고 쓰는 안전한 기저귀, 역류 없는 기저귀, 다소 비싼 가격",
                        gap: "높은 품질에 대한 신뢰는 있으나, 가격 저항감 존재"
                    },
                    strategy: [
                        { category: "Strengths", points: ["유럽 최고 등급의 안전성 인증 보유", "독보적인 역류 방지 기술력", "두터운 충성 고객층(킨도맘)"] },
                        { category: "Weaknesses", points: ["경쟁사 대비 높은 가격대", "소변 알림줄 부재(일부 소비자 불편 호소)", "오프라인 채널 접근성"] },
                        { category: "Opportunities", points: ["저출산 시대 '골드키즈' 트렌드에 따른 프리미엄 수요 증가", "스킨케어/물티슈 카테고리 교차 판매 확대"] },
                        { category: "Threats", points: ["글로벌 브랜드(팸퍼스) 및 가성비 PB 상품의 공세", "원자재 가격 상승 압박"] }
                    ],
                    actions: [
                        { phase: "Phase 1", title: "Safety Comm.", description: "안전성 인증 팩트 체크 캠페인으로 신뢰도 강화", timeline: "2024년" },
                        { phase: "Phase 2", title: "Lineup Diversification", description: "슬림핏/썸머 등 시즌 및 기능별 라인업 세분화", timeline: "2025년 상반기" },
                        { phase: "Phase 3", title: "Lifestyle Brand", description: "기저귀를 넘어 '프리미엄 육아 라이프스타일' 브랜드로 확장", timeline: "2025년 하반기" }
                    ],
                    sentiments: [
                        { category: "positive", text: "밤기저귀로 킨도만한 게 없어요. 역류가 진짜 안 됩니다.", source: "맘카페" },
                        { category: "positive", text: "발진 걱정 없이 쓸 수 있어서 신생아 때부터 씁니다.", source: "공식몰 리뷰" },
                        { category: "negative", text: "소변줄이 없어서 초보 엄마 입장에선 확인하기 좀 어려워요.", source: "블로그" },
                        { category: "negative", text: "품질은 좋은데 가격이 너무 비싸서 핫딜만 기다려요.", source: "SNS" }
                    ]
                }),
                userId: randomUser.id,
            },
        })

        // 5. BBQ Chicken (Requested Sample)
        await prisma.brandAnalysis.create({
            data: {
                brandKor: 'BBQ',
                brandEng: 'Best of the Best Quality',
                url: 'https://bbq.co.kr/',
                socialUrls: JSON.stringify({
                    instagram: 'https://www.instagram.com/bbq.chicken.official',
                    youtube: 'https://www.youtube.com/c/BBQChicken_Official'
                }),
                category: 'F&B (Chicken)',
                target: 'All Ages',
                competitors: 'bhc, 교촌치킨, 굽네치킨',
                content: JSON.stringify({
                    kpis: [
                        { label: "Global Stores", value: "700+", trend: "up", change: "+50", description: "미국 등 해외 매장의 빠른 확장세" },
                        { label: "Brand Brand", value: "No.1", trend: "neutral", change: "Top", description: "국내 치킨 브랜드 평판 및 인지도 1위" },
                        { label: "Signature Sales", value: "High", trend: "up", change: "Steady", description: "'황금올리브' 시리즈의 압도적인 판매 비중" },
                        { label: "Price Perception", value: "High", trend: "neutral", change: "Issue", description: "프리미엄 가격 정책에 따른 '비싼 치킨' 인식" }
                    ],
                    insight: {
                        intent: "전 세계인이 즐기는 K-푸드의 대표주자, 'Best of the Best Quality'",
                        perception: "황금올리브가 맛있는 치킨 대장주, 하지만 가격 인상의 주범",
                        gap: "최고급 품질(올리브유) 강조와 가격 저항감 사이의 괴리"
                    },
                    strategy: [
                        { category: "Strengths", points: ["압도적인 시그니처 메뉴(황금올리브)", "강력한 글로벌 가맹 사업 노하우(치킨대학)", "프리미엄 원료(올리브유) 사용"] },
                        { category: "Weaknesses", points: ["지속적인 가격 인상 이슈로 인한 부정적 여론", "황금올리브 외 히트 메뉴 부족"] },
                        { category: "Opportunities", points: ["K-컬처 확산에 따른 글로벌 시장(미국, 동남아) 확장", "수제맥주 및 HMR 등 사업 다각화"] },
                        { category: "Threats", points: ["배달비/치킨값 상승에 따른 '탈프랜차이즈' 소비 트렌드", "편의점 치킨 등 저가 대체제 성장"] }
                    ],
                    actions: [
                        { phase: "Phase 1", title: "Global Expansion", description: "미국 내 주요 주(State) 거점 매장 확대 및 현지화 마케팅", timeline: "2024년" },
                        { phase: "Phase 2", title: "New Menu", description: "MZ세대 타겟의 시즈닝/소스 메뉴 강화로 '황올' 의존도 분산", timeline: "2025년 상반기" },
                        { phase: "Phase 3", title: "Digital Trans.", description: "자사 앱 활성화 및 멤버십 강화로 충성 고객 Lock-in", timeline: "2025년 하반기" }
                    ],
                    sentiments: [
                        { category: "positive", text: "역시 후라이드는 황금올리브가 진리입니다. 바삭함이 달라요.", source: "배달앱 리뷰" },
                        { category: "positive", text: "미국에서 BBQ 보니까 너무 반갑고 외국인들도 줄 서서 먹네요.", source: "유튜브" },
                        { category: "negative", text: "치킨값이 너무 비싸서 배달 시키기 부담스러워요.", source: "커뮤니티" },
                        { category: "negative", text: "황올 말고 다른 메뉴는 딱히 생각나는 게 없어요.", source: "블로그" }
                    ]
                }),
                userId: randomUser.id,
            },
        })
        console.log('Created sample analysis for', randomUser.email)
    }

    console.log('Seeding finished.')
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
