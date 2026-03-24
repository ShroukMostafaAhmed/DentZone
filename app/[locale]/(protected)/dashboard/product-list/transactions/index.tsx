"use client";

import * as React from "react";
import { useEffect, useState } from "react";
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
import { baseColumns } from "./columns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import TablePagination from "./table-pagination";
import { useParams } from "next/navigation";
import { CardContent } from "@/components/ui/card";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import Cookies from "js-cookie";

import useGettingAllProducts from "@/services/products/gettingAllProducts";
import GetCategories from "@/services/categories/getCategories";
import { ExportCSVButton } from "@/components/partials/export-csv/ExportCSVButton";
import SearchInput from "@/app/[locale]/(protected)/components/SearchInput/SearchInput";
import ExcelUploadButton from "@/app/[locale]/(protected)/dashboard/add-product-byExcel/ExcelUploadButton";
import { useTranslations } from "next-intl";
import { ProductType } from "@/types/product";

const TransactionsTable = () => {
  const t = useTranslations("productList");
  const params = useParams();
  const locale = params?.locale as string;
  
  const userRole = Cookies.get("userRole");
  const isAdmin = userRole === "Admin";

  const {
    loading,
    getAllProducts,
    products: data,
    error,
    includeDeleted,
    totalItems,
    totalPages: apiTotalPages,
  } = useGettingAllProducts();

  const {
    loading: categoriesLoading,
    gettingAllCategories,
  } = GetCategories();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [filteredProducts, setFilteredProducts] = useState<ProductType[]>([]);

  const columns = baseColumns({ 
    refresh: () => { getAllProducts("false") }, 
    t, 
    locale 
  });

  const table = useReactTable({
    data: filteredProducts ?? [],
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    initialState: {
      pagination: {
        pageSize: 50,
      },
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  useEffect(() => {
    gettingAllCategories();
    getAllProducts(includeDeleted);
  }, [includeDeleted]);

  useEffect(() => {
    if (data) setFilteredProducts(data);
  }, [data]);

  if (categoriesLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center py-4 px-6 gap-4 border-b border-solid border-default-200">
        <div className="flex-1 w-full max-w-sm">
          <SearchInput
            data={data ?? []}
            filterKey={locale === "ar" ? "productArabicName" : "productName"}
            setFilteredData={setFilteredProducts}
          />
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2 flex-wrap">
            <Link href="/dashboard/add-product">
              <Button size="md" variant="outline" className="font-medium">
                {t("addProduct")}
              </Button>
            </Link>

            <ExportCSVButton />

            <ExcelUploadButton
              onSuccess={() => {
                getAllProducts(includeDeleted);
                toast.success(t("dataRefreshed"));
              }}
            />
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : (
        <>
          <CardContent className="pt-6">
            <div className="border border-solid border-default-200 rounded-lg overflow-hidden">
              <Table>
                <TableHeader className="bg-default-200">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead className="last:text-start" key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id} className="h-[75px]">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="h-24 text-center">
                        {t("noProductsFound")}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          <TablePagination table={table} />
          <div className="text-center text-sm text-muted-foreground pb-4">
            {t("totalProducts")}: {totalItems} | {t("totalPages")}: {apiTotalPages}
          </div>
        </>
      )}
    </div>
  );
};

export default TransactionsTable;