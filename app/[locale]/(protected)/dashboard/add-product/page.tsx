"use client";

import { useEffect, useState } from "react";
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
import GetCategories from "@/services/categories/getCategories";
import { Loader2 } from "lucide-react";
import useCreateProduct from "@/services/products/createProduct";
import { toast } from "sonner";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";

const AddProduct = () => {
  const t = useTranslations("productList");
  const router = useRouter();

  const [name, setName] = useState<string>("");
  const [arabicName, setArabicName] = useState<string>("");
  const [preef, setPref] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [categorySearch, setCategorySearch] = useState<string>("");
  const [filteredCategories, setFilteredCategories] = useState<any[]>([]);

  const { loading: gettingAllCatLoading, data, gettingAllCategories } = GetCategories();
  const { createProduct, loading: creatingProductLoading } = useCreateProduct();

  useEffect(() => {
    gettingAllCategories();
  }, []);

  useEffect(() => {
    if (data) {
      const filtered = data.filter((category: any) =>
        category.name.toLowerCase().includes(categorySearch.toLowerCase())
      );
      setFilteredCategories(filtered);
    }
  }, [categorySearch, data]);

  const onSubmit = async () => {
    if (!name.trim() || !arabicName.trim() || !preef.trim() || !description.trim() || !categoryId) {
      toast.error(t("fillRequiredFields") || "الرجاء ملء جميع الحقول المطلوبة");
      return;
    }

    const formData = new FormData();
    formData.append("Name", name);
    formData.append("ArabicName", arabicName);
    formData.append("Preef", preef);
    formData.append("Description", description);
    formData.append("CategoryId", categoryId);
    
    if (photo) {
      formData.append("Photo", photo);
      formData.append("ImageName", photo.name); }

    try {
      const success = await createProduct(formData);
      if (success) {
        toast.success(t("productCreated"));
        router.push("/dashboard/product-list");
      }
    } catch (error) {
      toast.error(t("productCreationError"));
    }
  };

  if (gettingAllCatLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" size={40} />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-4 rounded-lg">
      <div className="col-span-12 space-y-4">
        <Card>
          <CardHeader className="border-b border-solid border-default-200 mb-6">
            <CardTitle>{t("productDetails")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center flex-wrap">
              <Label className="w-[150px] flex-none">{t("productName")}</Label>
              <Input
                type="text"
                placeholder={t("productName")}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="flex items-center flex-wrap">
              <Label className="w-[150px] flex-none">{t("ArabicName")}</Label>
              <Input
                type="text"
                placeholder={t("arabicName")}
                value={arabicName}
                onChange={(e) => setArabicName(e.target.value)}
              />
            </div>

            <div className="flex items-center flex-wrap">
              <Label className="w-[150px] flex-none">{t("productPref")}</Label>
              <Input
                type="text"
                placeholder={t("productPref")}
                value={preef}
                onChange={(e) => setPref(e.target.value)}
              />
            </div>

            <div className="flex items-center flex-wrap">
              <Label className="w-[150px] flex-none">{t("productPhoto")}</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setPhoto(e.target.files?.[0] || null)}
              />
            </div>

            <div className="flex items-center flex-wrap gap-4 md:gap-0">
              <Label className="w-[150px] flex-none">{t("category")}</Label>
              <Select onValueChange={(value) => setCategoryId(value)}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder={t("selectCategoryPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  <div className="px-2 py-1">
                    <Input
                      placeholder={t("searchCategory")}
                      value={categorySearch}
                      onChange={(e) => setCategorySearch(e.target.value)}
                    />
                  </div>
                  <SelectGroup>
                    {filteredCategories.map((category: any) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center flex-wrap">
              <Label className="w-[150px] flex-none">{t("description")}</Label>
              <Textarea
                placeholder={t("description")}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="col-span-12 flex justify-end">
        <Button onClick={onSubmit} disabled={creatingProductLoading}>
          {creatingProductLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : t("save")}
        </Button>
      </div>
    </div>
  );
};

export default AddProduct;