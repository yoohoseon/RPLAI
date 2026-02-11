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

    const handleSearch = () => {
        const params = new URLSearchParams(searchParams);

        if (brand) params.set('brand', brand);
        else params.delete('brand');

        if (userName) params.set('userName', userName);
        else params.delete('userName');

        // For Team Name, strict match or contains? 
        // Previously it was 'contains'. But dropdown sends exact name usually.
        // Let's keep it 'teamName' param. 
        if (teamName && teamName !== 'all') params.set('teamName', teamName);
        else params.delete('teamName');

        // Reset page to 1 when searching
        params.set('page', '1');

        replace(`${pathname}?${params.toString()}`);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className="flex flex-col sm:flex-row gap-4 mb-6 items-end">
            <div className="flex flex-col gap-2 w-full sm:w-auto">
                <label className="text-sm font-medium">Brand</label>
                <Input
                    placeholder="Filter by Brand"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full sm:w-[200px]"
                />
            </div>

            <div className="flex flex-col gap-2 w-full sm:w-auto">
                <label className="text-sm font-medium">User Name</label>
                <Input
                    placeholder="Filter by User Name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full sm:w-[200px]"
                    autoComplete="off"
                />
            </div>

            <div className="flex flex-col gap-2 w-full sm:w-auto">
                <label className="text-sm font-medium">Team Name</label>
                <Select
                    value={teamName || 'all'}
                    onValueChange={(value) => setTeamName(value === 'all' ? '' : value)}
                >
                    <SelectTrigger className="w-full sm:w-[200px]">
                        <SelectValue placeholder="Select Team" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Teams</SelectItem>
                        {teams.map((team) => (
                            <SelectItem key={team.id} value={team.name}>
                                {team.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <Button onClick={handleSearch} className="w-full sm:w-auto">
                <Search className="mr-2 h-4 w-4" />
                Search
            </Button>
        </div>
    );
}
