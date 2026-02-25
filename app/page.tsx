import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import PublicHeader from '@/components/public-header';

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    if (session.user.role === 'TEAM_MEMBER') {
      redirect('/main');
    }
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F9FAFB] relative overflow-hidden font-sans">
      <PublicHeader />

      <main className="flex-1 flex flex-col items-center justify-center p-6 pt-24 text-center animate-in fade-in duration-1000">
        <div className="max-w-4xl space-y-10 relative z-10">
          <div className="inline-flex items-center justify-center px-5 py-2 rounded-2xl bg-white border border-[#F2F4F6] text-[#EE2924] text-[15px] font-bold shadow-sm mb-4">
            ✨ AI-Powered Brand Analytics 플랫폼
          </div>

          <div className="space-y-6">
            <h1 className="text-5xl md:text-[80px] font-bold tracking-tight text-[#191F28] leading-[1.1] break-keep">
              데이터로 이끄는<br />
              <span className="text-[#EE2924]">브랜드의 성장</span>
            </h1>
            <p className="text-xl md:text-[22px] font-medium text-[#4E5968] max-w-2xl mx-auto leading-relaxed break-keep">
              고급 AI 분석으로 도출하는 심도 있는 시장 인사이트.<br />
              이제 데이터 기반의 차세대 브랜드 전략을 경험해보세요.
            </p>
          </div>

          <div className="pt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" className="h-16 w-full sm:w-80 px-12 text-[18px] font-bold rounded-[24px] shadow-lg shadow-[#EE2924]/10 transition-all duration-300 bg-[#EE2924] hover:bg-[#D11F1B] text-white border-none active:scale-[0.98]">
                시작하기
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 ml-2">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </Button>
            </Link>
          </div>

          <div className="pt-20 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {[
              { title: "시장 인텔리전스", desc: "실시간 데이터를 기반으로 업계 동향과 경쟁사를 정밀 분석합니다." },
              { title: "AI 전략 수립", desc: "브랜드 페르소나와 타겟에 최적화된 마케팅 전략을 생성합니다." },
              { title: "자동화 리포트", desc: "복잡한 분석 결과를 한눈에 이해할 수 있는 리포트로 제공합니다." }
            ].map((item, idx) => (
              <div key={idx} className="bg-white p-8 rounded-[32px] border border-[#F2F4F6] shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
                <h3 className="text-[18px] font-bold text-[#191F28] mb-3">{item.title}</h3>
                <p className="text-[15px] font-medium text-[#4E5968] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-[#EE2924]/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      </main>
    </div>
  );
}
