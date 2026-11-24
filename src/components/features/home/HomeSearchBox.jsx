'use client';

import { useRouter } from 'next/navigation';
import SearchBar from '@/components/ui/SearchBar';

export default function HomeSearchBox() {
  const router = useRouter();

  const handleSearch = (queryText) => {
    const params = new URLSearchParams();
    if (queryText) params.set('q', queryText);
    const qs = params.toString();
    router.push(qs ? `/artworks?${qs}` : '/artworks');
  };

  return <SearchBar compact onSubmit={handleSearch} />;
}
