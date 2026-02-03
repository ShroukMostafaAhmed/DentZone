import { useState } from "react";
import { ProductType } from "@/types/product";
import AxiosInstance from "@/lib/AxiosInstance";

function useGettingAllProducts() {
  const [loading, setLoading] = useState<boolean>(false);
  const [products, setProducts] = useState<ProductType[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [includeDeletedState, setIncludeDeletedState] = useState<string>("false");
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Get all products at once (for client-side pagination - current behavior)
  const getAllProducts = async (includeDeleted: string) => {
    setLoading(true);
    setError(null);
    setIncludeDeletedState(includeDeleted);

    try {
      // Fetch first page to get total count
      const firstResponse = await AxiosInstance.get(
        `/api/Products/GetProducts?includeDeleted=${includeDeleted}&page=1&size=50`
      );

      if (firstResponse.status === 204) {
        setProducts([]);
        setTotalItems(0);
        setTotalPages(1);
        setLoading(false);
        return;
      }

      if (firstResponse.status === 200 || firstResponse.status === 201) {
        if (!firstResponse.data || !firstResponse.data.data) {
          setProducts([]);
          setTotalItems(0);
          setTotalPages(1);
          setLoading(false);
          return;
        }

        // Extract pagination info (totalPages, totalItems)
        const totalPages = firstResponse.data.totalPages || 1;
        const totalItems = firstResponse.data.totalItems || firstResponse.data.data.length;

        setTotalItems(totalItems);
        setTotalPages(totalPages);

        let allProducts = [...firstResponse.data.data];

        // Fetch remaining pages if there are more
        if (totalPages > 1) {
          const requests = [];
          for (let page = 2; page <= totalPages; page++) {
            requests.push(
              AxiosInstance.get(
                `/api/Products/GetProducts?includeDeleted=${includeDeleted}&page=${page}&size=50`
              )
            );
          }

          const results = await Promise.all(requests);
          results.forEach((res) => {
            if ((res.status === 200 || res.status === 201) && res.data?.data) {
              allProducts = [...allProducts, ...res.data.data];
            }
          });
        }

        setProducts(allProducts);
      } else {
        if (firstResponse.data?.errors) {
          const firstKey = Object.keys(firstResponse.data.errors)[0];
          const firstMessage =
            firstResponse.data.errors[firstKey]?.[0] || "Unknown error";
          setError(`${firstKey}: ${firstMessage}`);
        } else {
          setError("An unexpected error occurred.");
        }
      }
    } catch (err: any) {
      console.error("Error fetching products:", err);

      if (err?.response?.status === 404) {
        setError("Products endpoint not found.");
      } else if (err?.response?.status === 401) {
        setError("Unauthorized. Please log in again.");
      } else if (err?.response?.status === 403) {
        setError("Access forbidden.");
      } else if (err?.response?.data?.errors) {
        const apiErrors = err.response.data.errors;
        const firstKey = Object.keys(apiErrors)[0];
        const firstMessage =
          apiErrors[firstKey]?.[0] || "Unknown error";
        setError(`${firstKey}: ${firstMessage}`);
      } else if (err?.message) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    getAllProducts,
    loading,
    error,
    products,
    includeDeleted: includeDeletedState,
    setIncludeDeletedState,
    totalItems, // Return totalItems
    totalPages, // Return totalPages
  };
}

export default useGettingAllProducts;
