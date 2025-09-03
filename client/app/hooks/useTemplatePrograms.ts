import { useState, useEffect } from 'react';
import { programApi } from '../services/api';
import { Program, ProgramListResponse } from '../types';

export interface UseTemplateProgramsOptions {
  autoFetch?: boolean;
  limit?: number;
}

export interface UseTemplateProgramsReturn {
  templatePrograms: Program[];
  loading: boolean;
  error: string | null;
  total: number;
  refreshTemplatePrograms: () => Promise<void>;
  loadMoreTemplatePrograms: () => Promise<void>;
  hasMoreTemplatePrograms: boolean;
}

export const useTemplatePrograms = (options: UseTemplateProgramsOptions = {}): UseTemplateProgramsReturn => {
  const [templatePrograms, setTemplatePrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [hasMoreTemplatePrograms, setHasMoreTemplatePrograms] = useState(true);

  const { autoFetch = true, limit = 20 } = options;

  const fetchTemplatePrograms = async (opts?: { append?: boolean; reset?: boolean }) => {
    try {
      setLoading(true);
      setError(null);

      console.log('[useTemplatePrograms] Fetching template programs...', { offset, limit });

      const response: ProgramListResponse = await programApi.getTemplatePrograms({
        limit,
        offset,
      });

      console.log('[useTemplatePrograms] Received response:', response);
      console.log('[useTemplatePrograms] Template programs count:', response.programs?.length);
      console.log('[useTemplatePrograms] Template programs:', response.programs);

      setHasMoreTemplatePrograms(response.programs.length === limit);
      if (opts?.append) {
        setTemplatePrograms(prev => [...prev, ...response.programs]);
      } else {
        setTemplatePrograms(response.programs);
      }
      setTotal(response.total);

    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors du chargement des programmes templates';
      setError(errorMessage);
      console.error('[useTemplatePrograms] Error fetching template programs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch) {
      setOffset(0);
      fetchTemplatePrograms({ reset: true });
    }
  }, [autoFetch]);

  const refreshTemplatePrograms = async () => {
    setOffset(0);
    await fetchTemplatePrograms({ reset: true });
  };

  const loadMoreTemplatePrograms = async () => {
    if (!hasMoreTemplatePrograms || loading) return;
    const nextOffset = offset + limit;
    setOffset(nextOffset);
    await fetchTemplatePrograms({ append: true });
  };

  return {
    templatePrograms,
    loading,
    error,
    total,
    refreshTemplatePrograms,
    loadMoreTemplatePrograms,
    hasMoreTemplatePrograms,
  };
};