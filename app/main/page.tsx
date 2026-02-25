import { BrandRegistrationForm } from "@/components/home/brand-registration-form";

export default function MainPage() {
    return (
        <div className="relative min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 md:p-8">
            <div className="container mx-auto grid lg:grid-cols-2 gap-12 items-center max-w-7xl">
                {/* Left Column: Hero Text */}
                <div className="space-y-6 text-center lg:text-left animate-in fade-in slide-in-from-left-5 duration-1000">

                    <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 pb-2">
                        AI 기반<br />브랜드 분석
                    </h1>
                    <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto lg:mx-0">
                        몇 초 만에 심도 있는 시장 인사이트를 도출합니다. 브랜드 성능을 분석하고 포지셔닝을 파악하여, 고급 AI로 무장한 실행 가능한 전략을 얻어보세요.
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center lg:justify-start pt-4">
                        <div className="flex items-center gap-2 text-sm font-medium bg-white dark:bg-slate-900 px-4 py-2 rounded-full shadow-sm border">
                            <span className="text-blue-500">✓</span> 라이프스타일
                        </div>
                        <div className="flex items-center gap-2 text-sm font-medium bg-white dark:bg-slate-900 px-4 py-2 rounded-full shadow-sm border">
                            <span className="text-purple-500">✓</span> 지식/관여도
                        </div>
                        <div className="flex items-center gap-2 text-sm font-medium bg-white dark:bg-slate-900 px-4 py-2 rounded-full shadow-sm border">
                            <span className="text-green-500">✓</span> 소통 관계
                        </div>
                    </div>
                </div>

                {/* Right Column: Analysis Form */}
                <div className="w-full animate-in fade-in slide-in-from-right-5 duration-1000 delay-200">
                    <div className="bg-white/80 dark:bg-black/40 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                        <div className="mb-8">
                            <h2 className="text-2xl font-bold tracking-tight mb-2">브랜드 정보등록</h2>
                            <p className="text-sm text-muted-foreground">아래에 브랜드 정보를 입력하여 브랜드를 등록하세요.</p>
                        </div>

                        <BrandRegistrationForm />
                    </div>
                </div>
            </div>
        </div>
    );
}
