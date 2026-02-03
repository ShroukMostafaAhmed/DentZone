"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";

interface SearchInputProps {
    data: any[];
    setFilteredData: (data: any[]) => void;
    filterKey: string;
}

const SearchInput: React.FC<SearchInputProps> = ({ data, setFilteredData, filterKey }) => {
    const [searchValue, setSearchValue] = useState("");

    useEffect(() => {
        if (searchValue === "") {
            setFilteredData(data); // reset to all data
        } else {
            const filtered = data.filter((item) =>
                item[filterKey]?.toLowerCase().includes(searchValue.toLowerCase())
            );
            setFilteredData(filtered);
        }
    }, [searchValue, data, filterKey, setFilteredData]);

    return (
        <Input
            type="text"
            placeholder={`Search by ${filterKey}`}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full max-w-xl"
        />
    );
};

export default SearchInput;