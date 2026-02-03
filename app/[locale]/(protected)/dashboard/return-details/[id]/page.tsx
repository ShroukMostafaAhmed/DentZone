"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation"; // CHANGED THIS LINE
import GettingReturnById from "@/services/returns/gettingReturnById";
import useUpdateReturnStatus from "@/services/returns/updateReturnStatus";
import Cookies from "js-cookie";

const ReturnDetails = () => { // REMOVED THE PROPS
  const [returnData, setReturnData] = useState<any>(undefined);
  const [selectedStatus, setSelectedStatus] = useState<string>("requested");
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Get user type from cookies (safe for server-side)
  const [userType, setUserType] = useState<string | undefined>(undefined);
  useEffect(() => {
    if (typeof window !== "undefined") {
      setUserType(Cookies.get("userRole") || undefined);
    }
  }, []);

  // Use the custom hook for updating return status
  const { loading: updating, updateReturnStatus } = useUpdateReturnStatus();

  // Get ID from both params and search params safely
  const idFromParams = params?.id;
  const idFromQuery = searchParams?.get("id");
  const id = Array.isArray(idFromParams) ? idFromParams[0] : idFromParams || idFromQuery || "";

  const { returnData: fetchedData, loading: fetching, error, getReturnById } = GettingReturnById();

  // Fetch data
  useEffect(() => {
    if (id) {
      getReturnById(id);
    }
  }, [id]);

  // Convert numeric status to string for Select component
  useEffect(() => {
    if (fetchedData) {
      const statusMap: Record<number, string> = { 0: "requested", 4: "completed" };
      const statusValue =
        typeof fetchedData.status === "number"
          ? statusMap[fetchedData.status] || "requested"
          : fetchedData.status || "requested";

      setReturnData({ ...fetchedData, status: statusValue });
      setSelectedStatus(statusValue);
    }
  }, [fetchedData]);

  useEffect(() => {
    if (error) {
      toast.error("Error", { description: error });
    }
  }, [error]);

  // Update Return Status
  const handleUpdateReturnStatus = async () => {
    if (!id) {
      toast.error("Error", { description: "Return ID is missing" });
      return;
    }

    try {
      const statusMap: Record<string, number> = { requested: 0, completed: 4 };
      const statusValue = statusMap[selectedStatus] ?? 0;
      const updatedData = { status: statusValue };

      const result = await updateReturnStatus(id, updatedData);

      if (result.success) {
        toast.success("Return Updated", { description: "Return Status Updated Successfully" });

        setReturnData((prev: any) => ({ ...prev, status: selectedStatus }));

        // REMOVED: if (onStatusUpdate) onStatusUpdate();

        getReturnById(id);

        setTimeout(() => router.push("/dashboard/return-list"), 1200);
      } else {
        toast.error("Failed", { description: result.error || "Update Failed" });
      }
    } catch (err: any) {
      toast.error("Failed", { description: err?.response?.data || "An unexpected error occurred" });
    }
  };

  const isLoading = fetching || updating;
  const currentStatus = returnData?.status || "requested";
  const hasStatusChanged = selectedStatus !== currentStatus;

  if (fetching) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-10">
          <div className="text-center">
            <Icon icon="svg-spinners:ring-resize" className="h-8 w-8 mx-auto mb-2" />
            <p>Loading return details...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getReasonForProduct = (productId: string) => {
    const returnedItem = returnData?.inventoryUser?.returnedItems?.find(
      (item: any) => item.productId === productId
    );
    if (returnedItem?.reason?.reason) return returnedItem.reason.reason;
    if (returnedItem?.otherReason) return returnedItem.otherReason;

    const returnOrderItem = returnData?.returnOrderInventoryUsers?.[0]?.returnedItems?.find(
      (item: any) => item.productId === productId
    );
    if (returnOrderItem?.reason?.reason) return returnOrderItem.reason.reason;
    if (returnOrderItem?.otherReason) return returnOrderItem.otherReason;

    const productPriceReturnItem = returnData?.inventoryUser?.productPrices?.[0]?.returnedItems?.find(
      (item: any) => item.productId === productId
    );
    if (productPriceReturnItem?.reason?.reason) return productPriceReturnItem.reason.reason;
    if (productPriceReturnItem?.otherReason) return productPriceReturnItem.otherReason;

    return "N/A";
  };

  return (
    <>
      {userType === "Inventory" && (
        <Card>
          <CardHeader>
            <CardTitle>Update Return Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center flex-wrap gap-4">
                <Label className="w-[150px] flex-none">Return Status: </Label>
                <Select
                  value={selectedStatus}
                  onValueChange={setSelectedStatus}
                  disabled={isLoading || returnData?.status === "completed"}
                >
                  <SelectTrigger className="flex-1 cursor-pointer">
                    <SelectValue placeholder="Select status">
                      <div className="flex items-center gap-2">
                        {selectedStatus === "requested" ? (
                          <>
                            <Icon icon="heroicons:clock" className="h-4 w-4 text-yellow-600" />
                            <span>Requested</span>
                          </>
                        ) : (
                          <>
                            <Icon icon="heroicons:check-circle" className="h-4 w-4 text-emerald-600" />
                            <span>Completed</span>
                          </>
                        )}
                      </div>
                    </SelectValue>
                  </SelectTrigger>

                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Status</SelectLabel>
                      <SelectItem value="requested">
                        <div className="flex items-center gap-2">
                          <Icon icon="heroicons:clock" className="h-4 w-4 text-yellow-600" />
                          <span>Requested</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="completed">
                        <div className="flex items-center gap-2">
                          <Icon icon="heroicons:check-circle" className="h-4 w-4 text-emerald-600" />
                          <span>Completed</span>
                        </div>
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-center flex-wrap gap-4">
                <Button
                  size="md"
                  variant="outline"
                  className="w-[150px] flex-none"
                  type="button"
                  disabled={isLoading || !hasStatusChanged || returnData?.status === "completed"}
                  onClick={handleUpdateReturnStatus}
                >
                  {updating ? (
                    <>
                      <Icon icon="svg-spinners:ring-resize" className="h-4 w-4 mr-2" />
                      Updating...
                    </>
                  ) : (
                    "Update Status"
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="border-0">
          <div className="flex justify-between flex-wrap gap-4 items-center">
            <div>
              <span className="block text-default-900 font-medium text-xl">Return Details</span>
              <div className="text-default-500 mt-4 text-sm">
                <div className="mb-4">
                  <span className="font-medium">Pharmacy Name:</span>{" "}
                  {returnData?.pharmacyName || returnData?.pharmacyUser?.bussinesName || "N/A"}
                </div>

                {returnData?.items?.length ? (
                  returnData.items.map((item: any, index: number) => {
                    const productPrice = returnData.inventoryUser?.productPrices?.find(
                      (pp: any) => pp.id === item.productPriceId
                    );
                    const product = productPrice?.product;
                    const reason = getReasonForProduct(item.productId);

                    return (
                      <div key={index} className="mt-4 p-4 border border-gray-200 rounded bg-gray-50">
                        <div>
                          <span className="font-medium">Product:</span> {product?.name || "N/A"}
                        </div>
                        <div>
                          <span className="font-medium">Quantity Returned:</span>{" "}
                          {item.quantityReturned || "N/A"}
                        </div>
                        <div>
                          <span className="font-medium">Price per unit:</span>{" "}
                          {productPrice?.salesPrice ? `$${productPrice.salesPrice.toFixed(2)}` : "N/A"}
                        </div>
                        <div>
                          <span className="font-medium">Total Amount:</span>{" "}
                          {productPrice?.salesPrice && item.quantityReturned
                            ? `$${(productPrice.salesPrice * item.quantityReturned).toFixed(2)}`
                            : "N/A"}
                        </div>
                        <div>
                          <span className="font-medium">Reason:</span> {reason}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-4 text-gray-500">No items found</div>
                )}
              </div>
              <br />
              <h4 className="text-default-600 text-xs uppercase mb-2">Return Id: {returnData?.id || "N/A"}</h4>
              <h4 className="text-default-600 text-xs uppercase">Return Date: {returnData?.requestDate || "N/A"}</h4>
              <h4 className="text-default-600 text-xs uppercase mt-2">
                Status:{" "}
                <span className={`px-2 py-1 rounded text-xs ${returnData?.status === "completed"
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
                  }`}>
                  {returnData?.status === "completed" ? "Completed" : "Requested"}
                </span>
              </h4>
            </div>
          </div>
        </CardHeader>
      </Card>
    </>
  );
};

export default ReturnDetails;