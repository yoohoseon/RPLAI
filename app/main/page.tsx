import { BrandRegistrationForm } from "@/components/home/brand-registration-form";

export default function MainPage() {
    return (
        <div className="relative min-h-[calc(100vh-4rem)] bg-[#F9FAFB] flex items-center justify-center p-4 md:p-8 font-sans">
            <div className="container mx-auto grid lg:grid-cols-2 gap-16 items-center max-w-7xl">
                {/* Left Column: Hero Text */}
                <div className="space-y-8 text-center lg:text-left animate-in fade-in slide-in-from-left-5 duration-1000">
                    <div className="space-y-4">
                        <h1 className="text-5xl lg:text-[72px] font-bold tracking-tight text-[#191F28] leading-[1.15]">
                            데이터로 이끄는<br />
                            <span className="text-[#3182F6]">브랜드의 성장</span>
                        </h1>
                        <p className="text-[19px] lg:text-[22px] font-medium text-[#4E5968] leading-relaxed max-w-xl mx-auto lg:mx-0 break-keep">
                            단 몇 초 만에 심도 있는 시장 인사이트를 도출합니다.<br />
                            고급 AI 분석으로 실행 가능한 브랜드 전략을 세워보세요.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3 justify-center lg:justify-start pt-4">
                        <div className="flex items-center gap-2 text-[15px] font-bold bg-white text-[#4E5968] px-5 py-2.5 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-[#F2F4F6]">
                            <span className="text-[#3182F6]">✓</span> 라이프스타일 큐레이션
                        </div>
                        <div className="flex items-center gap-2 text-[15px] font-bold bg-white text-[#4E5968] px-5 py-2.5 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-[#F2F4F6]">
                            <span className="text-[#3182F6]">✓</span> 지식/관여도 분석
                        </div>
                        <div className="flex items-center gap-2 text-[15px] font-bold bg-white text-[#4E5968] px-5 py-2.5 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-[#F2F4F6]">
                            <span className="text-[#3182F6]">✓</span> 디지털 소통 구조
                        </div>
                    </div>
                </div>

                {/* Right Column: Analysis Form */}
                <div className="w-full animate-in fade-in slide-in-from-right-5 duration-1000 delay-200">
                    <div className="bg-white rounded-[2.5rem] p-10 shadow-[0_12px_40px_rgba(0,0,0,0.06)] border border-[#F2F4F6] relative overflow-hidden group">
                        <div className="mb-10 text-center lg:text-left">
                            <h2 className="text-2xl lg:text-3xl font-bold tracking-tight mb-3 text-[#191F28]">브랜드 정보 등록</h2>
                            <p className="text-[15px] font-medium text-[#4E5968]">분석할 브랜드의 정보를 입력해 주세요.</p>
                        </div>

                        <BrandRegistrationForm />
                    </div>
                </div>
            </div>
        </div>
    );
}
