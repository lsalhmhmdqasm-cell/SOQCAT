import { useState, useEffect } from 'react';
import { api } from '../services/api';

interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export const usePagination = <T>(endpoint: string, perPage: number = 20) => {
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const [meta, setMeta] = useState<PaginationMeta>({
        current_page: 1,
        last_page: 1,
        per_page: perPage,
        total: 0
    });

    useEffect(() => {
        fetchData();
    }, [meta.current_page, endpoint]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get(`${endpoint}?page=${meta.current_page}&per_page=${perPage}`);
            setData(res.data.data || res.data);

            if (res.data.meta || res.data.current_page) {
                setMeta({
                    current_page: res.data.current_page || res.data.meta?.current_page || 1,
                    last_page: res.data.last_page || res.data.meta?.last_page || 1,
                    per_page: res.data.per_page || res.data.meta?.per_page || perPage,
                    total: res.data.total || res.data.meta?.total || 0
                });
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const setPage = (page: number) => {
        setMeta(prev => ({ ...prev, current_page: page }));
    };

    return {
        data,
        loading,
        meta,
        setPage,
        refresh: fetchData
    };
};
