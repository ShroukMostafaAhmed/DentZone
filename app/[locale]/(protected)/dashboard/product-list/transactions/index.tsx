"use client";

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
import { CardContent } from "@/components/ui/card";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import useGettingAllProducts from "@/services/products/gettingAllProducts";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import GetCategories from "@/services/categories/getCategories";
import Cookies from "js-cookie";
import { ProductType } from "@/types/product";
import SearchInput from "@/app/[locale]/(protected)/components/SearchInput/SearchInput";
import { useTranslations } from "next-intl";
import ExcelUploadButton from "@/app/[locale]/(protected)/dashboard/add-product-byExcel/ExcelUploadButton";

const TransactionsTable = () => {
  const t = useTranslations("productList");
  const userRole = Cookies.get("userRole");
  const userId = Cookies.get("userId");

  const {
    loading,
    getAllProducts,
    products: data,
    error,
    includeDeleted,
    setIncludeDeletedState,
    totalItems,
    totalPages: apiTotalPages,
  } = useGettingAllProducts();

  const {
    loading: categoriesLoading,
    data: categories,
    gettingAllCategories,
  } = GetCategories();

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [filteredProducts, setFilteredProducts] = useState<ProductType[]>([]);

  const columns = baseColumns({ refresh: () => getAllProducts("false"), t });

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
        pageSize: 50, // Set page size to 50
      },
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const transformedProducts = (data ?? []).map((product) => {
    const allPrices = product.prices ?? [];
    const userPrices = allPrices.filter((p) => p.inventoryUserId === userId);

    let selectedPrice;
    if (userPrices.length > 0) {
      selectedPrice = userPrices.sort(
        (a, b) =>
          new Date(b.creationDate).getTime() -
          new Date(a.creationDate).getTime()
      )[0];
    } else {
      selectedPrice = allPrices.sort(
        (a, b) =>
          new Date(b.creationDate).getTime() -
          new Date(a.creationDate).getTime()
      )[0];
    }

    return {
      id: product.id ?? "",
      name: product.name,
      salesPrice: selectedPrice?.salesPrice ?? "",
      purchasePrice: selectedPrice?.purchasePrice ?? "",
      creationDate: selectedPrice?.creationDate ?? "",
      categoryName: product.category.name ?? "",
      categoryId: product.category.id ?? "",
    };
  });

  const handleCSVUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload-csv", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) throw new Error("Upload failed");
  };

  useEffect(() => {
    gettingAllCategories();
  }, []);

  useEffect(() => {
    getAllProducts(includeDeleted);
  }, [includeDeleted]);

  useEffect(() => {
    if (data) setFilteredProducts(data);
  }, [data]);

  if (categoriesLoading == true) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (error) {
    toast.error("Something went wrong", {
      description: error,
    });
  }

  return (
    <div className="w-full">
      <div className="flex justify-between flex-row items-center py-4 px-6 border-b border-solid border-default-200">
        <div className="flex flex-row items-center w-full gap-4 justify-between">
          <div className="flex items-center gap-4 w-full flex-wrap">
            <SearchInput
              data={data ?? []}
              filterKey={"name"}
              setFilteredData={setFilteredProducts}
            />
            {userRole == "Admin" && (
              <div className="flex items-center gap-3">
                <Link href="/dashboard/add-product">
                  <Button size={"md"} variant="outline" color="secondary">
                    {t("addProduct")}
                  </Button>
                </Link>
                <ExcelUploadButton
                  onSuccess={() => {
                    getAllProducts(includeDeleted);
                    toast.success(
                      t("dataRefreshed") || "Product list refreshed"
                    );
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {loading == true ? (
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : (
        <>
          <CardContent className="pt-6">
            <div className="border border-solid border-default-200 rounded-lg overflow-hidden border-t-0">
              <Table>
                <TableHeader className="bg-default-200">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => {
                        return (
                          <TableHead
                            className="last:text-start"
                            key={header.id}
                          >
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                          </TableHead>
                        );
                      })}
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
                        {t("noProductsFound")}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>

          {/* Pagination component */}
          <TablePagination table={table} />

          {/* Optional: Show total items info */}
          <div className="text-center text-sm text-muted-foreground pb-4">
            {t("totalProducts") || "Total products"}: {totalItems} | {t("totalPages") || "Total pages"}: {apiTotalPages}
          </div>
        </>
      )}
    </div>
  );
};

export default TransactionsTable;