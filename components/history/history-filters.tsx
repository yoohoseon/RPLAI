'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface HistoryFiltersProps {
    teams: { id: string; name: string }[];
}

export default function HistoryFilters({ teams }: HistoryFiltersProps) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    // Local state for inputs
    const [brand, setBrand] = useState(searchParams.get('brand')?.toString() || '');
    const [userName, setUserName] = useState(searchParams.get('userName')?.toString() || '');
    const [teamName, setTeamName] = useState(searchParams.get('teamName')?.toString() || '');
    const [sort, setSort] = useState(searchParams.get('sort')?.toString() || 'date-desc');

    const handleSearch = () => {
        const params = new URLSearchParams(searchParams);

        if (brand) params.set('brand', brand);
        else params.delete('brand');

        if (userName) params.set('userName', userName);
        else params.delete('userName');

        if (teamName && teamName !== 'all') params.set('teamName', teamName);
        else params.delete('teamName');

        if (sort && sort !== 'date-desc') params.set('sort', sort);
        else params.delete('sort');

        params.set('page', '1');

        replace(`${pathname}?${params.toString()}`);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className="bg-white p-8 rounded-[32px] border border-[#F2F4F6] shadow-[0_8px_30px_rgba(0,0,0,0.04)] mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 items-end">
                <div className="space-y-2.5">
                    <label className="text-[14px] font-bold text-[#8B95A1] ml-1 flex items-center gap-1.5">
                        브랜드
                    </label>
                    <Input
                        placeholder="브랜드명 입력"
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="h-12 bg-[#F9FAFB] border-[#F2F4F6] rounded-2xl px-4 text-[15px] font-bold focus:ring-[#EE2924]/20 transition-all"
                    />
                </div>

                <div className="space-y-2.5">
                    <label className="text-[14px] font-bold text-[#8B95A1] ml-1 flex items-center gap-1.5">
                        작성자
                    </label>
                    <Input
                        placeholder="이름 입력"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="h-12 bg-[#F9FAFB] border-[#F2F4F6] rounded-2xl px-4 text-[15px] font-bold focus:ring-[#EE2924]/20 transition-all"
                        autoComplete="off"
                    />
                </div>

                <div className="space-y-2.5">
                    <label className="text-[14px] font-bold text-[#8B95A1] ml-1 flex items-center gap-1.5">
                        소속 팀
                    </label>
                    <Select
                        value={teamName || 'all'}
                        onValueChange={(value) => setTeamName(value === 'all' ? '' : value)}
                    >
                        <SelectTrigger className="h-12 bg-[#F9FAFB] border-[#F2F4F6] rounded-2xl px-4 text-[15px] font-bold focus:ring-[#EE2924]/20 transition-all">
                            <SelectValue placeholder="모든 팀" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-[#F2F4F6] shadow-xl">
                            <SelectItem value="all" className="rounded-xl font-medium py-3">모든 팀</SelectItem>
                            {teams.map((team) => (
                                <SelectItem key={team.id} value={team.name} className="rounded-xl font-medium py-3">
                                    {team.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2.5">
                    <label className="text-[14px] font-bold text-[#8B95A1] ml-1 flex items-center gap-1.5">
                        정렬 옵션
                    </label>
                    <Select
                        value={sort}
                        onValueChange={(value) => setSort(value)}
                    >
                        <SelectTrigger className="h-12 bg-[#F9FAFB] border-[#F2F4F6] rounded-2xl px-4 text-[15px] font-bold focus:ring-[#EE2924]/20 transition-all">
                            <SelectValue placeholder="정렬 방식" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-[#F2F4F6] shadow-xl">
                            <SelectItem value="date-desc" className="rounded-xl font-medium py-3">최신순</SelectItem>
                            <SelectItem value="date-asc" className="rounded-xl font-medium py-3">과거순</SelectItem>
                            <SelectItem value="brand-asc" className="rounded-xl font-medium py-3">브랜드명 (가나다)</SelectItem>
                            <SelectItem value="brand-desc" className="rounded-xl font-medium py-3">브랜드명 (역순)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <Button
                    onClick={handleSearch}
                    className="h-12 bg-[#EE2924] hover:bg-[#D11F1B] text-white rounded-2xl font-bold text-[15px] shadow-lg shadow-[#EE2924]/10 active:scale-[0.98] transition-all"
                >
                    <Search className="mr-2 h-4 w-4" />
                    조회하기
                </Button>
            </div>
        </div>
    );
}
