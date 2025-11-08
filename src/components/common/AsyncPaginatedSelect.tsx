"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type PageResult<T> = {
  items: T[];
  total: number;
};

type Option = { value: string; label: string };

type AsyncPaginatedSelectProps<T> = {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  getOptionLabel: (item: T) => string;
  getOptionValue: (item: T) => string;
  fetchPage: (page: number, size: number) => Promise<PageResult<T>>;
  pageSize?: number;
  disabled?: boolean;
};

export function AsyncPaginatedSelect<T>(props: AsyncPaginatedSelectProps<T>) {
  const {
    value,
    onChange,
    placeholder = "Seleccionar...",
    getOptionLabel,
    getOptionValue,
    fetchPage,
    pageSize = 20,
    disabled,
  } = props;

  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<T[]>([]);
  const viewportRef = useRef<HTMLDivElement | null>(null);

  const options: Option[] = useMemo(
    () => items.map((i) => ({ value: getOptionValue(i), label: getOptionLabel(i) })),
    [items, getOptionLabel, getOptionValue]
  );

  const hasMore = items.length < total;

  const loadPage = useCallback(
    async (nextPage: number) => {
      if (loading) return;
      setLoading(true);
      try {
        const res = await fetchPage(nextPage, pageSize);
        setItems((prev) => (nextPage === 0 ? res.items : [...prev, ...res.items]));
        setTotal(res.total);
        setPage(nextPage);
      } catch (e) {
        // silent fail, keep UX simple
        // console.error(e);
      } finally {
        setLoading(false);
      }
    },
    [fetchPage, pageSize, loading]
  );

  useEffect(() => {
    if (open) {
      loadPage(0);
    }
  }, [open, loadPage]);

  const onViewportRef = (el: HTMLDivElement | null) => {
    viewportRef.current = el;
    if (!el) return;
    const handleScroll = () => {
      if (!viewportRef.current || loading || !hasMore) return;
      const { scrollTop, scrollHeight, clientHeight } = viewportRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 24) {
        // near bottom
        loadPage(page + 1);
      }
    };
    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  };

  const selectedLabel = useMemo(() => {
    const found = options.find((o) => o.value === value);
    return found?.label;
  }, [options, value]);

  return (
    <Select value={value} onValueChange={onChange} open={open} onOpenChange={setOpen} disabled={disabled}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder}>{selectedLabel}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {/* Radix Select doesn't expose viewport ref directly through our wrapper, so we hook into DOM */}
        <div ref={onViewportRef as any} className="max-h-56 overflow-y-auto p-1">
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
          {loading && (
            <div className="text-xs text-muted-foreground px-2 py-2">Cargando...</div>
          )}
          {!loading && options.length === 0 && (
            <div className="text-xs text-muted-foreground px-2 py-2">Sin resultados</div>
          )}
          {!loading && hasMore && (
            <div className="text-xs text-muted-foreground px-2 py-2">Desplázate para cargar más</div>
          )}
        </div>
      </SelectContent>
    </Select>
  );
}

export default AsyncPaginatedSelect;
