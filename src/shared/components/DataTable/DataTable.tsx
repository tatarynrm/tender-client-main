"use client";
import React, { useRef } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  ColumnDef,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface DataTableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  pageCount?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void; // Новий пропс
  pageSize?: number;
  isLoading?: boolean;
}

export function DataTable<TData>({
  columns,
  data,
  pageCount = 1,
  currentPage = 1,
  onPageChange,
  onPageSizeChange,
  pageSize = 20,
  isLoading = false,
}: DataTableProps<TData>) {
  const table = useReactTable({
    data,
    columns,
    manualPagination: true,
    pageCount,
    getCoreRowModel: getCoreRowModel(),
    state: {
      pagination: {
        pageIndex: currentPage - 1,
        pageSize,
      },
    },
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (e.deltaY !== 0 && scrollRef.current) {
      scrollRef.current.scrollLeft += e.deltaY;
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    isDragging.current = true;
    startX.current = e.pageX - (scrollRef.current?.offsetLeft ?? 0);
    scrollLeft.current = scrollRef.current?.scrollLeft ?? 0;
  };
  const handleMouseLeave = () => (isDragging.current = false);
  const handleMouseUp = () => (isDragging.current = false);
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging.current || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    scrollRef.current.scrollLeft = scrollLeft.current - walk;
  };

  return (
    <div className="rounded-md border shadow-sm bg-white dark:bg-slate-800">
      <div
        ref={scrollRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        className="overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing select-none"
      >
        <Table className="w-full min-w-[800px] border-collapse">
          <TableHeader className="bg-gray-100 dark:bg-slate-700">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-b border-gray-200 dark:border-slate-600">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-left text-sm font-semibold px-4 py-2 border-r border-gray-200 dark:border-slate-600 last:border-r-0">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-6 text-muted-foreground">
                  Завантаження...
                </TableCell>
              </TableRow>
            ) : data.length ? (
              table.getRowModel().rows.map((row, rowIndex) => (
                <TableRow
                  key={row.id}
                  className={`border-b border-gray-200 dark:border-slate-600 ${rowIndex % 2 === 0 ? "bg-gray-50 dark:bg-slate-800" : ""} hover:bg-gray-100 dark:hover:bg-slate-700 transition`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-4 py-2 text-xs border-r border-gray-200 dark:border-slate-600 last:border-r-0">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-6 text-muted-foreground">
                  Немає даних
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-slate-700 text-sm">
        <div className="flex items-center gap-6">
          <div>
            Сторінка <b>{currentPage}</b> з {pageCount}
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Рядків на сторінці:</span>
            <Select
              value={String(pageSize)}
              onValueChange={(val) => onPageSizeChange?.(Number(val))}
            >
              <SelectTrigger className="w-[70px] h-8">
                <SelectValue placeholder={pageSize} />
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 50, 100].map((v) => (
                  <SelectItem key={v} value={String(v)}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange?.(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Назад
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange?.(currentPage + 1)}
            disabled={currentPage === pageCount}
          >
            Вперед
          </Button>
        </div>
      </div>
    </div>
  );
}