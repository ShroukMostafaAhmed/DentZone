import { useState } from "react";
import { Price } from "@/types/price";
import AxiosInstance from "@/lib/AxiosInstance";

function useGettingPricesByInventoryId() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [prices, setPrices] = useState<Price[]>([]);

  const gettingPricesByInventoryId = async (
    inventoryId: string | string[] | undefined
  ) => {
    setLoading(true);
    setError(null);
    await AxiosInstance.get(
      `/api/ProductPrices/by-inventory-user/${inventoryId}`
    )
      .then((response) => {
        if (response.status !== 200) {
          throw new Error("Failed to fetch prices");
        }
        setPrices(response.data);
      })
      .catch((error) => {
        setError(error.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return {
    loading,
    error,
    prices,
    gettingPricesByInventoryId,
  };
}

export default useGettingPricesByInventoryId;
