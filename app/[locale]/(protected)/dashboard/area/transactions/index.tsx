"use client";

import { useEffect, useState } from "react";
import * as React from "react";
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { getColumns } from "./columns";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import TablePagination from "./table-pagination";
import { Card, CardContent } from "@/components/ui/card";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/routing";
import useGettingAllMainAreas from "@/services/area/gettingAllMainAreas";
import useGettingAllSubArea from "@/services/subArea/gettingAllSubArea";
import { AreaType, MainArea } from "@/types/areas";

const AreasTable = () => {
  // Getting all areas
  const {
    loading: mainAreasLoading,
    mainAreas,
    getAllMainAreas,
    error: mainAreasError
  } = useGettingAllMainAreas();

  // Getting all secondary areas
  const {
    error: subAreasError,
    allSubArea,
    loading: subAreasLoading,
    getAllSubArea
  } = useGettingAllSubArea();

  const router = useRouter();

  const [selectedAreaType, setSelectedAreaType] = useState<"main" | "secondary">("main");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  // Create refresh function
  const handleRefresh = React.useCallback(() => {
    if (selectedAreaType === "main") {
      getAllMainAreas();
    } else if (selectedAreaType === "secondary") {
      getAllSubArea();
    }
  }, [selectedAreaType, getAllMainAreas, getAllSubArea]);

  // Filter areas based on selected type
  const filteredAreas = React.useMemo<MainArea[]>(() => {
    if (selectedAreaType === "main") return mainAreas || [];
    if (selectedAreaType === "secondary") return allSubArea || [];
    return [];
  }, [selectedAreaType, mainAreas, allSubArea]);

  // Get columns with proper refresh function
  const columns = React.useMemo(() => {
    return getColumns({
      areaType: selectedAreaType,
      onRefresh: handleRefresh
    });
  }, [selectedAreaType, handleRefresh]);

  const table = useReactTable({
    data: filteredAreas,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  // Load data when component mounts or area type changes
  useEffect(() => {
    handleRefresh();
  }, [selectedAreaType]);

  // Handle loading states
  const isLoading = selectedAreaType === "main" ? mainAreasLoading : subAreasLoading;
  const hasError = selectedAreaType === "main" ? mainAreasError : subAreasError;

  if (isLoading) {
    return (
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="text-sm text-gray-600">Loading {selectedAreaType} areas...</p>
          </div>
        </div>
    );
  }

  if (hasError) {
    return (
        <Card className="w-full">
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-red-600 mb-2">Error loading {selectedAreaType} areas</p>
              <Button onClick={handleRefresh} variant="outline">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
    );
  }

  return (
      <Card className="w-full">
        <div className="flex justify-between flex-wrap gap-4 items-center py-4 px-5">
          <div className="flex-1 text-xl flex gap-4 font-medium text-default-900">
            <Select
                value={selectedAreaType}
                onValueChange={(value: "main" | "secondary") => setSelectedAreaType(value)}
            >
              <SelectTrigger className="w-[180px] cursor-pointer">
                <SelectValue placeholder="Select Area Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Area Types</SelectLabel>
                  <SelectItem value="main">Main Areas</SelectItem>
                  <SelectItem value="secondary">Secondary Areas</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button
                size="md"
                variant="outline"
                onClick={handleRefresh}
                disabled={isLoading}
            >
              {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Refreshing...
                  </>
              ) : (
                  "Refresh"
              )}
            </Button>
            <Button
                size="md"
                variant="outline"
                onClick={() => router.push(`/dashboard/add-area/${selectedAreaType}`)}
            >
              Add {selectedAreaType === "main" ? "Area" : "Sub-Area"}
            </Button>
          </div>
        </div>

        <CardContent>
          <div className="border border-solid border-default-200 rounded-lg overflow-hidden border-t-0">
            <Table>
              <TableHeader className="bg-default-200">
                {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                          <TableHead className="last:text-start" key={header.id}>
                            {header.isPlaceholder
                                ? null
                                : flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                )}
                          </TableHead>
                      ))}
                    </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                        <TableRow
                            key={row.id}
                            data-state={row.getIsSelected() && "selected"}
                        >
                          {row.getVisibleCells().map((cell) => (
                              <TableCell key={cell.id} className="h-[75px]">
                                {flexRender(
                                    cell.column.columnDef.cell,
                                    cell.getContext()
                                )}
                              </TableCell>
                          ))}
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                      <TableCell
                          colSpan={columns.length}
                          className="h-24 text-center"
                      >
                        No {selectedAreaType} areas found.
                      </TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>

        <TablePagination table={table} />
      </Card>
  );
};

export default AreasTable;