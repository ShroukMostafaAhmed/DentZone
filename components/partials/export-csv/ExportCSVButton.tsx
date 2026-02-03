"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import useDownloadCsv from "@/services/products/csv/downloadCSV";
import { useTranslations } from "next-intl";

export function ExportCSVButton() {
    const t = useTranslations("exportFile");

    // Custom hook to handle CSV download logic
    const { loading, error, downloadCSV } = useDownloadCsv();

    const handleClick = async () => {
        try {
            await downloadCSV();
            if (!error) {
                toast.success(t("fileDownloaded"));
            } else {
                throw new Error(error);
            }
        } catch (e) {
            toast.error(t("fileDownloadError"));
        }
    };

    return (
        <Button onClick={handleClick} disabled={loading}>
            {loading ? `${t("Exporting")}...` : t("exportFile")}
        </Button>
    );
}