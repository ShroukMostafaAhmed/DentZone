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
import {baseColumns} from "./columns";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import {useRouter} from "@/i18n/routing";
import {useEffect, useState} from "react";
import {Loader2} from "lucide-react";
import {Button} from "@/components/ui/button";
import useTransactionBalance from "@/services/Reports/balance/transactionBalance";
import useAccountBalance from "@/services/Reports/balance/accountBalance";
import useBalanceSummary from "@/services/Reports/balance/balanceSummary";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { DateRange } from "react-day-picker";
import { format, subDays } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {UserType} from "@/types/users";
import {Label} from "@/components/ui/label";
import GetUsers from "@/services/users/GetAllUsers";
import {BalanceAccountType, BalanceAccountTypeLabel, TransactionType, TransactionTypeLabel} from "@/enum";

interface BalanceTableTypes {
    type: "account" | "transaction" | "summary";
}

export default function TransactionsTable({type = "account"} : BalanceTableTypes) {
    const router = useRouter();

    // using custom hook to fetch transactions reports
    const {transactions, fetchTransactions, loading: loadingTransactions} = useTransactionBalance()

    // using custom hook to fetch balance reports
    const {loading: loadingBalances, balances, gettingAccountBalances} = useAccountBalance()

    // using custom hook to fetch summary reports
    const {loading: loadingSummary, summary, fetchBalanceSummary} = useBalanceSummary()

    // getting all users
    const {loading: loadingGettingAllUsers, gettingAllUsers, data} = GetUsers()

    // State for filter values
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: subDays(new Date(), 30),
        to: new Date(),
    });
    const [userId, setUserId] = useState<string>("");
    const [accountType, setAccountType] = useState<BalanceAccountType | undefined>(undefined);
    const [transactionType, setTransactionType] = useState<TransactionType | undefined>(undefined);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(20);

    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});


    // Get the appropriate data based on type
    const getCurrentData = () => {
        switch (type) {
            case "transaction":
                return transactions;
            case "account":
                return balances;
            case "summary":
                return null; // Summary doesn't have items array
            default:
                return balances;
        }
    };

    // Get the appropriate loading state based on type
    const getCurrentLoading = () => {
        switch (type) {
            case "transaction":
                return loadingTransactions;
            case "account":
                return loadingBalances;
            case "summary":
                return loadingSummary;
            default:
                return loadingBalances;
        }
    };

    const currentData = getCurrentData();
    const currentLoading = getCurrentLoading();

    const fetchData = () => {
        const params = new URLSearchParams();

        // Add filters only if they have values
        if (dateRange?.from) {
            params.set('StartDate', dateRange.from.toISOString());
        }
        if (dateRange?.to) {
            params.set('EndDate', dateRange.to.toISOString());
        }
        if (userId) {
            params.set('UserId', userId);
        }
        if (accountType !== undefined) {
            params.set('AccountType', accountType);
        }
        if (transactionType !== undefined) {
            params.set('TransactionType', transactionType);
        }

        // Always add pagination params
        params.set('PageNumber', pageNumber.toString());
        params.set('PageSize', pageSize.toString());

        console.log(`${type} params:`, params.toString());

        // Call the appropriate API based on type
        switch (type) {
            case "transaction":
                fetchTransactions(params.toString());
                break;
            case "account":
                gettingAccountBalances(params.toString());
                break;
            case "summary":
                fetchBalanceSummary(params.toString());
                break;
        }
    };

    const columns = baseColumns({ refresh: fetchData, type });

    const table = useReactTable({
        data: type === "summary" ? [] : (currentData?.items ?? []),
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

    // Fetch dropdown data on mount
    useEffect(() => {
        gettingAllUsers();
    }, []);

    // Fetch data when page number or page size changes
    useEffect(() => {
        fetchData();
    }, [pageNumber, pageSize, type]);


    const handleApplyFilters = () => {
        setPageNumber(1); // Reset to first page when filters change
        fetchData();
    };

    const handleResetFilters = () => {
        setDateRange({
            from: subDays(new Date(), 30),
            to: new Date(),
        });
        setUserId("");
        setAccountType(undefined);
        setTransactionType(undefined);
        setPageNumber(1);
        setPageSize(20);

        fetchData();
    };

    const handlePageChange = (newPage: number) => {
        setPageNumber(newPage);
    };

    if (loadingGettingAllUsers) {
        return (
            <div className="flex items-center justify-center h-full py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
            </div>
        );
    }

    const getTableTitle = () => {
        switch (type) {
            case "transaction":
                return "Transaction Balance Report";
            case "account":
                return "Account Balance Report";
            case "summary":
                return "Balance Summary Report";
            default:
                return "Balance Report";
        }
    };

    return (
        <Card className="w-full">
            <div className="px-5 py-4 flex flex-col gap-4">
                <Label>{getTableTitle()} - Filters</Label>
                <hr className="border-default-200" />

                {/* Date Range Picker */}
                <div className="flex flex-row items-center justify-center gap-2">
                    <Label htmlFor="date">Date Range</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                id="date"
                                variant={"outline"}
                                className={cn(
                                    "w-full justify-start text-left font-normal flex-1",
                                    !dateRange && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dateRange?.from ? (
                                    dateRange.to ? (
                                        <>
                                            {format(dateRange.from, "LLL dd, y")} -{" "}
                                            {format(dateRange.to, "LLL dd, y")}
                                        </>
                                    ) : (
                                        format(dateRange.from, "LLL dd, y")
                                    )
                                ) : (
                                    <span>Pick a date range</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={dateRange?.from}
                                selected={dateRange}
                                onSelect={setDateRange}
                                numberOfMonths={2}
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                {/* User Select */}
                <div className="flex items-center gap-2">
                    <Label htmlFor="user">User</Label>
                    <Select
                        value={userId}
                        onValueChange={(value) => setUserId(value)}
                    >
                        <SelectTrigger className={"flex-1"}>
                            <SelectValue placeholder="Select User" />
                        </SelectTrigger>
                        <SelectGroup>
                            <SelectContent>
                                {data?.map((user: UserType) => (
                                    <SelectItem key={user.id} value={user.id}>
                                        {user.userName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </SelectGroup>
                    </Select>
                </div>

                {/* Account Type Filter - Show for account and summary types */}
                {(type === "account" || type === "summary") && (
                    <div className="flex items-center gap-2">
                        <Label htmlFor="accountType">Account Type</Label>
                        <Select
                            value={accountType === undefined ? "" : accountType}
                            onValueChange={(value) => {
                                if (value === "all") {
                                    setAccountType(undefined);
                                } else if (Object.values(BalanceAccountType).includes(value as BalanceAccountType)) {
                                    setAccountType(value as BalanceAccountType);
                                }
                            }}
                        >
                            <SelectTrigger className={"flex-1"}>
                                <SelectValue placeholder="Filter by Account Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Account Types</SelectItem>
                                {Object.values(BalanceAccountType).map((type) => (
                                    <SelectItem key={type} value={type}>
                                        {BalanceAccountTypeLabel[type]}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {/* Transaction Type Filter - Show for transaction and summary types */}
                {(type === "transaction" || type === "summary") && (
                    <div className="flex items-center gap-2">
                        <Label htmlFor="transactionType">Transaction Type</Label>
                        <Select
                            value={transactionType === undefined ? "" : transactionType}
                            onValueChange={(value) => {
                                if (value === "all") {
                                    setTransactionType(undefined);
                                } else if (Object.values(TransactionType).includes(value as TransactionType)) {
                                    setTransactionType(value as TransactionType);
                                }
                            }}
                        >
                            <SelectTrigger className={"flex-1"}>
                                <SelectValue placeholder="Filter by Transaction Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Transaction Types</SelectItem>
                                {Object.values(TransactionType).map((type) => (
                                    <SelectItem key={type} value={type}>
                                        {TransactionTypeLabel[type]}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                <div className="flex gap-2">
                    <Button onClick={handleApplyFilters} className="w-full">
                        Apply Filters
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handleResetFilters}
                        className="w-full"
                    >
                        Reset Filters
                    </Button>
                </div>
            </div>

            {currentLoading ? (
                <div className="flex items-center justify-center h-full py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                </div>
            ) : type === "summary" ? (
                <CardContent>
                    {/* Summary Report Display */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg border">
                            <h3 className="text-sm font-medium text-blue-600">Total Balance</h3>
                            <p className="text-2xl font-bold text-blue-900">${summary?.totalBalance?.toLocaleString() || 0}</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg border">
                            <h3 className="text-sm font-medium text-green-600">Total Credit Limit</h3>
                            <p className="text-2xl font-bold text-green-900">${summary?.totalCreditLimit?.toLocaleString() || 0}</p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg border">
                            <h3 className="text-sm font-medium text-purple-600">Total Accounts</h3>
                            <p className="text-2xl font-bold text-purple-900">{summary?.totalAccounts?.toLocaleString() || 0}</p>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-lg border">
                            <h3 className="text-sm font-medium text-orange-600">Total Transactions</h3>
                            <p className="text-2xl font-bold text-orange-900">{summary?.totalTransactions?.toLocaleString() || 0}</p>
                        </div>
                        <div className="bg-emerald-50 p-4 rounded-lg border">
                            <h3 className="text-sm font-medium text-emerald-600">Total Deposits</h3>
                            <p className="text-2xl font-bold text-emerald-900">${summary?.totalDeposits?.toLocaleString() || 0}</p>
                        </div>
                        <div className="bg-red-50 p-4 rounded-lg border">
                            <h3 className="text-sm font-medium text-red-600">Total Withdrawals</h3>
                            <p className="text-2xl font-bold text-red-900">${summary?.totalWithdrawals?.toLocaleString() || 0}</p>
                        </div>
                    </div>
                </CardContent>
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

            {/* Custom pagination that works with the API - Only show for account and transaction types */}
            {type !== "summary" && currentData && (
                <div className="flex flex-col sm:flex-row items-center justify-between p-4 gap-4">
                    <div className="flex items-center gap-2">
                        <p className="text-sm text-muted-foreground">
                            Page {pageNumber} of {currentData.totalPages}
                        </p>
                        <Select
                            value={pageSize.toString()}
                            onValueChange={(value) => {
                                setPageSize(Number(value));
                                setPageNumber(1); // Reset to first page when page size changes
                            }}
                        >
                            <SelectTrigger className="h-8 w-[70px]">
                                <SelectValue placeholder={pageSize} />
                            </SelectTrigger>
                            <SelectContent side="top">
                                {[10, 20, 30, 40, 50].map((size) => (
                                    <SelectItem key={size} value={`${size}`}>
                                        {size}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(pageNumber - 1)}
                            disabled={pageNumber <= 1}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(pageNumber + 1)}
                            disabled={pageNumber >= currentData.totalPages}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </Card>
    );
};