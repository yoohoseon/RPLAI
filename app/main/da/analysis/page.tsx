import { generateDaAnalysis } from '@/app/lib/ai-da';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCircle2, Briefcase, MessageSquareText, AlertTriangle, Swords, BarChart3, TrendingUp, Search, Activity, Target, Zap, LayoutGrid, ChevronDown, ExternalLink } from 'lucide-react';
import { PersonaSidebar } from '@/components/analysis/persona-sidebar';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface DaAnalysisPageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function DaAnalysisPage(props: DaAnalysisPageProps) {
    const searchParams = await props.searchParams;
    let brandKor = (searchParams.brandKor as string) || 'Brand';
    let brandEng = (searchParams.brandEng as string) || '';
    let category = (searchParams.category as string) || 'General';
    let url = (searchParams.url as string) || '';
    let description = (searchParams.description as string) || '';
    let industry = (searchParams.industry as string) || '';
    let country = (searchParams.country as string) || '';
    let language = (searchParams.language as string) || '';
    let channels = (searchParams.channels as string) || '';
    let dateRange = (searchParams.dateRange as string) || '';
    let categoryKeywords = (searchParams.categoryKeywords as string) || '';
    let ourKeywords = (searchParams.ourKeywords as string) || '';
    let competitorKeywords = (searchParams.competitorKeywords as string) || '';

    let forceNew = searchParams.forceNew === "true";
    let id = searchParams.id as string;

    const session = await auth();
    const userId = session?.user?.id;

    if (id) {
        const record = await (prisma as any).brandDatas.findUnique({ where: { id } });
        if (record) {
            brandKor = record.brandKor;
            brandEng = record.brandEng;
            category = record.category;
            url = record.url;
            description = record.description || '';
        }
    }

    let analysisData;
    let isError = false;

    try {
        analysisData = await generateDaAnalysis(
            brandKor, brandEng, category, description, url, userId, forceNew,
            { industry, country, language, channels, dateRange, categoryKeywords, ourKeywords, competitorKeywords }
        );
    } catch (e) {
        console.error("DA Analysis failed:", e);
        isError = true;
    }

    if (isError || !analysisData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F2F4F7]">
                <div className="container max-w-lg mx-auto p-12 text-center bg-white rounded-[36px] shadow-[0_4px_30px_rgba(0,0,0,0.03)] border-none">
                    <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-8">
                        <AlertTriangle className="w-12 h-12" />
                    </div>
                    <h1 className="text-3xl font-bold mb-4 text-[#333333]">분석에 실패했습니다</h1>
                    <p className="text-[#4E5968] mb-10 text-lg font-medium break-keep">
                        데이터를 생성하는 도중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
                    </p>
                    <a href="/main/da" className="inline-flex items-center justify-center px-10 py-5 bg-[#F2F4F7] text-[#333333] font-bold rounded-2xl hover:bg-[#E5E8EB] transition-all shadow-none active:scale-[0.98] text-[16px]">
                        다시 시도하기
                    </a>
                </div>
            </div>
        );
    }

    const { bm, persona, personas, cdj, trends, messages, dbPersona, recommendedStage, competitors, _dbUrl, _inputParams } = analysisData as any;
    const initialStage = recommendedStage || 'awareness';

    // DB에 저장된 URL이 있으면 URL을 덮어씁니다 (검색 파라미터가 비어있을 경우 등 히스토리/DB 값 복원)
    if (!url) {
        url = _dbUrl || _inputParams?.url || '';
    }

    return (
        <div className="flex flex-col flex-1 font-sans bg-transparent">
            <div className="sticky top-16 z-50 w-full bg-white/90 backdrop-blur-md shadow-sm border-none transition-all py-1">
                <div className="w-full px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-baseline gap-3">
                        <h1 className="text-2xl font-bold tracking-tight text-[#333333] truncate max-w-[200px] sm:max-w-none">
                            {brandKor} <span className="text-[#4E5968] text-lg font-medium tracking-normal ml-2">{brandEng}</span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                        {url && (
                            <a
                                href={url.startsWith('http') ? url : `https://${url}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl font-bold text-[14px] bg-[#F2F4F7] text-[#4E5968] hover:bg-[#E5E8EB] transition-colors active:scale-95"
                            >
                                <ExternalLink className="w-4 h-4" />
                                공식 홈페이지 이동
                            </a>
                        )}
                        {/* Removed redundant "경쟁사 분석하기" button since it is now available in the sidebar */}
                    </div>
                </div>
            </div>

            <div className="w-full flex flex-col lg:flex-row flex-1 animate-in slide-in-from-bottom-8 fade-in duration-1000">

                <PersonaSidebar
                    initialPersonas={personas}
                    initialStage={initialStage}
                    initialCompetitors={competitors || []}
                    initialMessages={messages}
                    brandContext={{ brandKor, brandEng, category, description, url }}
                >

                    {/* Right Main Content */}
                    <div className="flex-1 min-w-0 py-10 px-4 sm:px-8 lg:px-12 xl:px-16 space-y-12 bg-[#F2F4F7]">

                        {/* CDJ Dashboard */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="mb-4">
                                <h2 className="text-3xl font-bold text-[#333333] mb-3">CDJ 분석 (Customer Decision Journey)</h2>
                                <p className="text-[17px] font-medium text-[#4E5968]">고객 탐색 여정 및 검색 의도를 파악합니다.</p>
                            </div>

                            {cdj && (
                                <div className="grid md:grid-cols-4 gap-4">
                                    {[
                                        { key: 'awareness', label: '인지 (Awareness)', color: 'bg-blue-500', icon: <Search className="w-5 h-5 text-blue-500" /> },
                                        { key: 'consideration', label: '유입 및 고려 (Consideration)', color: 'bg-indigo-500', icon: <Target className="w-5 h-5 text-indigo-500" /> },
                                        { key: 'purchase', label: '구매 (Purchase)', color: 'bg-orange-500', icon: <Zap className="w-5 h-5 text-orange-500" /> },
                                        { key: 'postPurchase', label: '구매 후 (Post Purchase)', color: 'bg-purple-500', icon: <Activity className="w-5 h-5 text-purple-500" /> },
                                    ].map((stage) => {
                                        const data = cdj[stage.key];
                                        return data ? (
                                            <Card key={stage.key} className="rounded-3xl border-none shadow-[0_8px_30px_rgba(0,0,0,0.04)] bg-white overflow-hidden">
                                                <div className={`h-1.5 w-full ${stage.color}`} />
                                                <CardContent className="p-6">
                                                    <div className="flex items-center gap-2 mb-4">
                                                        {stage.icon}
                                                        <h3 className="font-bold text-[#333333]">{stage.label}</h3>
                                                    </div>
                                                    <div className="text-3xl font-black text-[#333333] mb-4 text-center">
                                                        {data.percentage}%
                                                    </div>
                                                    <div className="space-y-4">
                                                        <div>
                                                            <h4 className="text-[12px] font-bold text-[#8B95A1] uppercase mb-1.5">핵심 키워드</h4>
                                                            <div className="flex flex-wrap gap-1">
                                                                {data.keywords?.slice(0, 3).map((kw: string, i: number) => (
                                                                    <span key={i} className="text-[12px] bg-[#F2F4F7] text-[#4E5968] font-medium px-2 py-0.5 rounded-md break-keep">#{kw}</span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <h4 className="text-[12px] font-bold text-[#8B95A1] uppercase mb-1.5">인사이트 ({data.insightTitle})</h4>
                                                            <p className="text-[13px] text-[#4E5968] font-medium leading-relaxed break-keep">
                                                                {data.insightDetail}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <h4 className="text-[12px] font-bold text-[#8B95A1] uppercase mb-1.5">소비자 행동</h4>
                                                            <p className="text-[13px] text-[#4E5968] font-medium leading-relaxed break-keep">
                                                                {data.consumerAction}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ) : null;
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Trends */}
                        {trends && (
                            <div className="space-y-6 pt-4">
                                <Card className="rounded-[2rem] border-none shadow-[0_8px_30px_rgba(0,0,0,0.04)] bg-white overflow-hidden">
                                    <CardContent className="p-0">
                                        <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#F2F4F6]">
                                            <div className="p-8">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500">
                                                        <TrendingUp className="w-6 h-6" />
                                                    </div>
                                                    <h3 className="text-[18px] font-bold text-[#333333]">시장 기반 트렌드 요약</h3>
                                                </div>
                                                <p className="text-[15px] text-[#4E5968] font-medium leading-relaxed break-keep">
                                                    {trends.summary}
                                                </p>
                                            </div>
                                            <div className="p-8">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500">
                                                        <LayoutGrid className="w-6 h-6" />
                                                    </div>
                                                    <h3 className="text-[18px] font-bold text-[#333333]">SERP 대응 요약 (검색 의도)</h3>
                                                </div>
                                                <p className="text-[15px] text-[#4E5968] font-medium leading-relaxed break-keep">
                                                    {trends.serpIntent}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* BM Section */}
                        <div className="space-y-6 pt-4">
                            <div className="mb-4">
                                <h2 className="text-3xl font-bold text-[#333333] mb-3">비즈니스 방향성 (BM)</h2>
                                <p className="text-[17px] font-medium text-[#4E5968]">입력된 정보를 기반으로 진단한 코어 비즈니스 모델입니다.</p>
                            </div>
                            <Card className="rounded-[2rem] border-none shadow-[0_8px_30px_rgba(0,0,0,0.04)] bg-white">
                                <CardHeader className="px-6 pt-6 pb-3 border-b border-[#F2F4F6] mb-5">
                                    <CardTitle className="text-[17px] font-bold flex items-center gap-2 text-[#333333]">
                                        <Briefcase className="w-5 h-5" />
                                        BM & Core Value
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="px-6 pb-6 space-y-6">
                                    <div className="space-y-2">
                                        <h4 className="text-[15px] font-bold text-[#8B95A1]">코어 모델 및 제공가치</h4>
                                        <p className="text-[#333333] font-medium text-[16px] leading-relaxed break-keep">{bm.coreModel}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="text-[15px] font-bold text-[#8B95A1]">메인 타겟 마켓</h4>
                                        <p className="text-[#333333] font-medium text-[16px] leading-relaxed break-keep">{bm.targetMarket}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="text-[15px] font-bold text-[#8B95A1]">디지털 차별화 전략</h4>
                                        <p className="text-[#333333] font-medium text-[16px] leading-relaxed break-keep">{bm.differentiation}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Key Copies Section */}
                        <div className="space-y-6 pt-4 w-full">
                            <div className="mb-4">
                                <h2 className="text-3xl font-bold text-[#333333] mb-3">키 카피 & 커뮤니케이션 메시지</h2>
                                <p className="text-[17px] font-medium text-[#4E5968]">타겟의 마음을 움직일 디지털 마케팅 메시지 전략입니다.</p>
                            </div>

                            <Card className="rounded-[2rem] border-none shadow-[0_8px_30px_rgba(0,0,0,0.04)] bg-white w-full">
                                <CardHeader className="px-6 pt-6 pb-3 border-b border-[#F2F4F6] mb-5">
                                    <CardTitle className="text-[17px] font-bold flex items-center gap-2 text-[#333333]">
                                        <MessageSquareText className="w-5 h-5" />
                                        Message Playbook
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="px-6 pb-6">
                                    <div className="bg-[#F2F4F7] rounded-[1.5rem] p-8 mb-8 text-center">
                                        <span className="text-[#8B95A1] font-bold text-[14px] uppercase tracking-wider mb-2 block">Hero Copy</span>
                                        <h3 className="text-2xl md:text-3xl font-black text-[#333333] break-keep leading-snug">
                                            "{messages.mainCopy}"
                                        </h3>
                                    </div>

                                    <div className="grid md:grid-cols-3 gap-6 mb-8">
                                        {messages.subCopies?.map((copy: string, i: number) => (
                                            <div key={i} className="bg-white border border-[#E5E8EB] p-6 rounded-2xl shadow-sm hover:border-[#0064FF] transition-colors group">
                                                <span className="text-[#0064FF] font-black text-[24px] opacity-20 group-hover:opacity-100 transition-opacity mb-2 block">0{i + 1}</span>
                                                <p className="text-[#333333] font-bold text-[16px] leading-relaxed break-keep">
                                                    {copy}
                                                </p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="border-t border-[#F2F4F6] pt-8">
                                        <h4 className="text-[15px] font-bold text-[#8B95A1] mb-3">채널 커뮤니케이션 전략</h4>
                                        <p className="text-[#333333] font-medium text-[16px] leading-relaxed break-keep mb-8 pb-8 border-b border-[#F2F4F6]">
                                            {messages.communicationStrategy}
                                        </p>

                                        <h4 className="text-[15px] font-bold text-[#8B95A1] mb-4">마케팅 퍼널별 전략</h4>
                                        <div className="space-y-4">
                                            <div className="bg-[#F9FAFB] p-5 rounded-2xl border border-[#F2F4F6]">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="w-6 h-6 rounded-full bg-[#E5E8EB] text-[#4E5968] flex items-center justify-center text-[13px] font-bold">1</span>
                                                    <h5 className="font-bold text-[#333333] text-[15px]">인지 (Awareness)</h5>
                                                </div>
                                                <p className="text-[#4E5968] font-medium text-[15px] leading-relaxed pl-8 break-keep">
                                                    {messages.funnelStrategy?.awareness}
                                                </p>
                                            </div>
                                            <div className="bg-[#F9FAFB] p-5 rounded-2xl border border-[#F2F4F6]">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="w-6 h-6 rounded-full bg-[#E5E8EB] text-[#4E5968] flex items-center justify-center text-[13px] font-bold">2</span>
                                                    <h5 className="font-bold text-[#333333] text-[15px]">유입/고려 (Consideration)</h5>
                                                </div>
                                                <p className="text-[#4E5968] font-medium text-[15px] leading-relaxed pl-8 break-keep">
                                                    {messages.funnelStrategy?.consideration}
                                                </p>
                                            </div>
                                            <div className="bg-[#F9FAFB] p-5 rounded-2xl border border-[#0064FF]/10">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="w-6 h-6 rounded-full bg-[#0064FF] text-white flex items-center justify-center text-[13px] font-bold">3</span>
                                                    <h5 className="font-bold text-[#0064FF] text-[15px]">전환 (Conversion)</h5>
                                                </div>
                                                <p className="text-[#4E5968] font-medium text-[15px] leading-relaxed pl-8 break-keep">
                                                    {messages.funnelStrategy?.conversion}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                    </div>
                </PersonaSidebar>
            </div>
        </div>
    );
}
