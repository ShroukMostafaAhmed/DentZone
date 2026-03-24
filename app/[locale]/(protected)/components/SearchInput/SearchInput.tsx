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
        if (!searchValue.trim()) {
            setFilteredData(data); 
        } else {
            const filtered = data.filter((item) => {
                const targetValue = item[filterKey];
                return targetValue 
                    ? targetValue.toString().toLowerCase().includes(searchValue.toLowerCase())
                    : false;
            });
            setFilteredData(filtered);
        }
    }, [searchValue, data, filterKey, setFilteredData]);

    return (
        <Input
            type="text"
            placeholder={`Search...`}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full max-w-xl"
        />
    );
};

export default SearchInput;