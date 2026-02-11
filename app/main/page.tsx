

export default function MainPage() {
    return (
        <div className="relative min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 md:p-8">
            <div className="container mx-auto grid lg:grid-cols-2 gap-12 items-center max-w-7xl">
                {/* Left Column: Hero Text */}
                <div className="space-y-6 text-center lg:text-left animate-in fade-in slide-in-from-left-5 duration-1000">

                    <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 pb-2">
                        AI-Powered<br />Brand Analysis
                    </h1>
                    <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto lg:mx-0">
                        Unlock deep market insights in seconds. Analyze your brand's performance, understand competitor positioning, and get actionable strategies powered by advanced AI.
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center lg:justify-start pt-4">
                        <div className="flex items-center gap-2 text-sm font-medium bg-white dark:bg-slate-900 px-4 py-2 rounded-full shadow-sm border">
                            <span className="text-blue-500">✓</span> SWOT Analysis
                        </div>
                        <div className="flex items-center gap-2 text-sm font-medium bg-white dark:bg-slate-900 px-4 py-2 rounded-full shadow-sm border">
                            <span className="text-purple-500">✓</span> Competitor Intel
                        </div>
                        <div className="flex items-center gap-2 text-sm font-medium bg-white dark:bg-slate-900 px-4 py-2 rounded-full shadow-sm border">
                            <span className="text-green-500">✓</span> Actionable FAQs
                        </div>
                    </div>
                </div>

                {/* Right Column: Analysis Form */}
                <div className="w-full animate-in fade-in slide-in-from-right-5 duration-1000 delay-200">
                    <div className="bg-white/80 dark:bg-black/40 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                        <div className="mb-8">
                            <h2 className="text-2xl font-bold tracking-tight mb-2">Start Your Analysis</h2>
                            <p className="text-sm text-muted-foreground">Enter your brand details below to generate a comprehensive report.</p>
                        </div>

                        <form action="/main/analysis" method="GET" className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label htmlFor="brand" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Brand Name</label>
                                    <input
                                        id="brand"
                                        name="brand"
                                        type="text"
                                        required
                                        placeholder="e.g. Nike"
                                        className="flex h-12 w-full rounded-lg border border-input bg-background/50 px-4 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="url" className="text-sm font-medium leading-none">Website URL</label>
                                    <input
                                        id="url"
                                        name="url"
                                        type="url"
                                        required
                                        placeholder="https://example.com"
                                        className="flex h-12 w-full rounded-lg border border-input bg-background/50 px-4 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="category" className="text-sm font-medium leading-none">Industry / Category</label>
                                <input
                                    id="category"
                                    name="category"
                                    type="text"
                                    required
                                    placeholder="e.g. Sportswear, SaaS, E-commerce"
                                    className="flex h-12 w-full rounded-lg border border-input bg-background/50 px-4 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
                                />
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label htmlFor="target" className="text-sm font-medium leading-none">Target Audience</label>
                                    <input
                                        id="target"
                                        name="target"
                                        type="text"
                                        required
                                        placeholder="e.g. Gen-Z, Professionals"
                                        className="flex h-12 w-full rounded-lg border border-input bg-background/50 px-4 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="competitors" className="text-sm font-medium leading-none">Key Competitors</label>
                                    <input
                                        id="competitors"
                                        name="competitors"
                                        type="text"
                                        required
                                        placeholder="e.g. Competitor A, B"
                                        className="flex h-12 w-full rounded-lg border border-input bg-background/50 px-4 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full inline-flex items-center justify-center rounded-lg text-base font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-[1.01] active:scale-[0.99] cursor-pointer h-14 shadow-lg hover:shadow-xl mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                            >
                                ✨ Generate Comprehensive Analysis
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
