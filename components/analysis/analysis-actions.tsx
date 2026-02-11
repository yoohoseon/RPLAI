'use client';

import { Button } from "@/components/ui/button";

interface AnalysisActionsProps {
    brand: string;
    url: string;
    category: string;
    target: string;
    competitors: string;
    content: string;
}

export default function AnalysisActions({ brand, url, category, target, competitors, content }: AnalysisActionsProps) {

    const handleRetry = () => {
        window.location.reload();
    };

    const handleDownloadPdf = () => {
        // Use browser print functionality
        // CSS in globals.css will handle hiding elements like the header
        window.print();
    };

    return (
        <div className="flex gap-4 justify-center mt-12 pb-10 print:hidden">
            <Button variant="outline" onClick={handleRetry} className="w-32">
                Retry
            </Button>

            <Button onClick={handleDownloadPdf} className="w-40 gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
                Download PDF
            </Button>
        </div>
    );
}
