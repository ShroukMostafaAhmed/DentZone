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

import { baseColumns } from "./columns";
import { Price } from "@/types/price";

import { Input } from "@/components/ui/input";
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

import useGettingPricesForInventoryManager from "@/services/productPrice/gettingPricesForInventoryManager";
import useGettingPricesByInventoryId from "@/services/productPrice/gettingPricesByInventoryId";
import useGetUsersByRoleId from "@/services/users/GetUsersByRoleId";

import Cookies from "js-cookie";
import { Loader2 } from "lucide-react";
import { ExportCSVButton } from "@/components/partials/export-csv/ExportCSVButton";
import { CSVUploadModal } from "@/components/partials/ImportCsv/ImportCsv";
import useUploadCsv from "@/services/products/csv/uploadCSV";
import { useTranslations } from "next-intl";

const TransactionsTable = () => {
  const userRole = Cookies.get("userRole");

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const { loading: uploadLoading, error: uploadError, uploadCSV } = useUploadCsv();

  // Non-admin prices
  const {
    loading: managerLoading,
    prices: managerPrices,
    gettingPricesForInventoryManager,
  } = useGettingPricesForInventoryManager();

  // Admin user prices
  const {
    loading: inventoryIdLoading,
    prices: adminPrices,
    gettingPricesByInventoryId,
  } = useGettingPricesByInventoryId();

  // Users for Admin select
  const {
    loading: usersLoading,
    users,
    getUsersByRoleId,
  } = useGetUsersByRoleId();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const isAdmin = userRole === "Admin";

  // Table Data: Admin → based on selected user, Others → default manager data
  const tableData = isAdmin ? adminPrices : managerPrices;
  const isLoading = isAdmin ? inventoryIdLoading : managerLoading;

  const t = useTranslations("inventoryManagement")

  const columns = baseColumns({ t });

  const table = useReactTable({
    data: tableData ?? [],
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


  useEffect(() => {
    if (isAdmin) {
      getUsersByRoleId("1A5A84FB-23C3-4F9B-A122-4C5BC6C5CB2D");
    } else {
      gettingPricesForInventoryManager();
    }
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      gettingPricesByInventoryId(selectedUserId);
    }
  }, [selectedUserId]);

  if (usersLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <Card className="w-full">
      <div className="flex flex-wrap gap-4 items-center py-4 px-5">
        {isAdmin && (
          <div className="flex-1 text-xl flex gap-4 font-medium text-default-900">
            <Select onValueChange={setSelectedUserId}>
              <SelectTrigger className="w-[150px] cursor-pointer">
                <SelectValue placeholder="Select Inventory" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Select Inventory</SelectLabel>
                  {users &&
                    users.map((user: any) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.userName}
                      </SelectItem>
                    ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        )}
        {!isAdmin && (
          <div className="flex flex-row justify-between w-full">
            <ExportCSVButton />
            <CSVUploadModal
              onUpload={async (file: File) => {
                await uploadCSV(file)
                gettingPricesForInventoryManager();
              }}
            />
          </div>
        )}
      </div>

      {isAdmin && !selectedUserId ? (
        <div className="text-center text-gray-500 py-10">Please select a inventory manager to view their prices.</div>
      ) : isLoading ? (
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : (
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
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      )}
      {!isAdmin || selectedUserId ? <TablePagination table={table} /> : null}
    </Card>
  );
};

export default TransactionsTable;