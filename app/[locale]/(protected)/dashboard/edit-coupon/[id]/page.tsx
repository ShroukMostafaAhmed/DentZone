"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import useGettingCouponById from "@/services/coupons/gettingCouponById";
import useUpdateCoupon from "@/services/coupons/updateCoupon";

const EditCoupon = () => {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const isEdit = Boolean(id);

  // getting coupon data
  const {coupon, getCouponById, loading: gettingCouponLoading, error: gettingCouponError} = useGettingCouponById()

  // updating coupon data
  const {updateCoupon, loading: updatingCouponLoading} = useUpdateCoupon()



  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState("");
  const [discountValue, setDiscountValue] = useState("");
  const [minimumOrderAmount, setMinimumOrderAmount] = useState("");
  const [maximumDiscountAmount, setMaximumDiscountAmount] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [usageLimit, setUsageLimit] = useState("");
  const [perUserLimit, setPerUserLimit] = useState("");
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    getCouponById(id)
  }, []);

  useEffect(() => {
    if (coupon) {
      setCode(coupon.code || "");
      setDescription(coupon.description || "");
      setDiscountType(coupon.discountType || "");
      setDiscountValue(coupon.discountValue?.toString() || "");
      setMinimumOrderAmount(coupon.minimumOrderAmount?.toString() || "");
      setMaximumDiscountAmount(coupon.maximumDiscountAmount?.toString() || "");
      setStartDate(coupon.startDate?.slice(0, 10) || "");
      setEndDate(coupon.endDate?.slice(0, 10) || "");
      setUsageLimit(coupon.usageLimit?.toString() || "");
      setPerUserLimit(coupon.perUserLimit?.toString() || "");
      setIsActive(coupon.isActive || false);
    }
  }, [coupon]);

  const onSubmit = async () => {
    if (!code.trim() || !discountType || !discountValue || !startDate || !endDate) {
      toast.error("Validation Error", {
        description: "Please fill all required fields.",
      });
      return;
    }

    if (Number(discountValue) <= 0) {
      toast.error("Validation Error", {
        description: "Discount Value must be greater than 0.",
      });
      return;
    }

    if (new Date(startDate) >= new Date(endDate)) {
      toast.error("Validation Error", {
        description: "Start date must be less than end date.",
      });
      return;
    }

    const payload = {
      code,
      description,
      discountType,
      discountValue: Number(discountValue),
      minimumOrderAmount: Number(minimumOrderAmount),
      maximumDiscountAmount: Number(maximumDiscountAmount),
      startDate,
      endDate,
      usageLimit: Number(usageLimit),
      perUserLimit: Number(perUserLimit),
      isActive,
    };

    try {
      const { success , error} = await updateCoupon( id, payload );
      if (success) {
        toast.success(isEdit ? "Coupon Updated" : "Coupon Created", {
          description: isEdit
              ? "Coupon has been updated successfully."
              : "Coupon has been added successfully.",
        });
        setTimeout(() => {
          router.push("/dashboard/coupons");
        }, 1000);
      }

      if (error) {
        toast.error("Failed", {
          description: error,
        });
      }
    } catch (err) {
      toast.error("Failed", {
        description: "Something went wrong.",
      });
    }
  };

  return (
      <div className="grid grid-cols-12 gap-4 rounded-lg">
        <div className="col-span-12 space-y-4">
          <Card>
            <CardHeader className="border-b border-default-200 mb-6">
              <CardTitle>{isEdit ? "Edit Coupon" : "Add New Coupon"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEdit && gettingCouponLoading ? (
                  <div className="text-muted-foreground">Loading coupon data...</div>
              ) : (
                  <>
                    <div className="flex items-center flex-wrap">
                      <Label className="w-[150px] flex-none">Coupon Code</Label>
                      <Input
                          type="text"
                          disabled
                          placeholder="e.g. SAVE10"
                          value={code}
                          onChange={(e) => setCode(e.target.value)}
                      />
                    </div>

                    <div className="flex items-center flex-wrap gap-4 md:gap-0">
                      <Label className="w-[150px] flex-none">Coupon Type</Label>
                      <Select disabled={true} value={discountType} onValueChange={(e) => setDiscountType(e)}>
                        <SelectTrigger className="flex-1 cursor-pointer">
                          <SelectValue placeholder="Select Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Type</SelectLabel>
                            <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
                            <SelectItem value="percentage">Percentage</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center flex-wrap">
                      <Label className="w-[150px] flex-none">Value</Label>
                      <Input
                          type="number"
                          placeholder="e.g. 10 or 20%"
                          value={discountValue}
                          onChange={(e) => setDiscountValue(e.target.value)}
                      />
                    </div>

                    <div className="flex items-center flex-wrap">
                      <Label className="w-[150px] flex-none">Number of Users</Label>
                      <Input
                          type="number"
                          placeholder="e.g. 100"
                          value={usageLimit}
                          onChange={(e) => setUsageLimit(e.target.value)}
                      />
                    </div>

                    <div className="flex items-center flex-wrap">
                      <Label className="w-[150px] flex-none">Start Date</Label>
                      <Input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                      />
                    </div>

                    <div className="flex items-center flex-wrap">
                      <Label className="w-[150px] flex-none">End Date</Label>
                      <Input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                      />
                    </div>

                    <div className="flex items-center flex-wrap">
                      <Label className="w-[150px] flex-none">Min Cost to Activate</Label>
                      <Input
                          type="number"
                          placeholder="e.g. 50"
                          value={minimumOrderAmount}
                          onChange={(e) => setMinimumOrderAmount(e.target.value)}
                      />
                    </div>

                    <div className="flex items-center flex-wrap gap-2">
                      <Label className="w-[150px] flex-none">Is Active</Label>
                      <Input
                          type="checkbox"
                          checked={isActive}
                          className="cursor-pointer w-4 h-4 rounded-full"
                          onChange={(e) => setIsActive(e.target.checked)}
                      />
                    </div>

                    <div className="flex items-center flex-wrap">
                      <Label className="w-[150px] flex-none">Description</Label>
                      <Textarea
                          placeholder="Enter description"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                      />
                    </div>
                  </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="col-span-12 flex justify-end">
          <Button
              disabled={updatingCouponLoading || (isEdit && gettingCouponLoading)}
              onClick={onSubmit}
              className={`cursor-pointer ${updatingCouponLoading ? "cursor-not-allowed" : ""}`}
          >
            {updatingCouponLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : isEdit ? (
                "Update Coupon"
            ) : (
                "Save Coupon"
            )}
          </Button>
        </div>
      </div>
  );
};

export default EditCoupon;
