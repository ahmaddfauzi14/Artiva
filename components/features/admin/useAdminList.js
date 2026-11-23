'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/shared/api-client';

export function useAdminList({
  endpoint,
  dataKey,
  initialItems = [],
  initialCounts = {},
  initialMeta = { page: 1, limit: 12, total: 0 },
  initialFilter = '',
  filterParam = 'status',
  limit = 12,
}) {
  const [items, setItems] = useState(initialItems);
  const [counts, setCounts] = useState(initialCounts);
  const [meta, setMeta] = useState(initialMeta);
  const [filter, setFilter] = useState(initialFilter);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchList = async ({
    nextFilter = filter,
    nextQ = q,
    nextPage = 1,
  } = {}) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const params = new URLSearchParams({
        page: String(nextPage),
        limit: String(limit),
      });
      if (nextFilter) params.set(filterParam, nextFilter);
      if (nextQ.trim()) params.set('q', nextQ.trim());

      const res = await apiFetch(`${endpoint}?${params.toString()}`);
      setItems(res.data[dataKey] || []);
      if (res.data.counts) setCounts(res.data.counts);
      setMeta(res.meta || { page: nextPage, limit, total: 0 });
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    items,
    counts,
    meta,
    filter,
    setFilter,
    q,
    setQ,
    loading,
    errorMsg,
    fetchList,
  };
}
