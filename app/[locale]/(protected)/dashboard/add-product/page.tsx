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
import useGettingAllActiveIngredient from "@/services/ActiveIngerients/gettingAllActiveIngerients";
import { useTranslations } from "next-intl";

const AddProduct = () => {
  const t = useTranslations("productList");
  const router = useRouter();

  const [name, setName] = useState<string>("")
  const [arabicName, setArabicName] = useState<string>("")
  const [preef, setPref] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [categoryId, setCategoryId] = useState<string>("")
  const [photo, setPhoto] = useState<File | null>(null);
  const [activeIngredientId, setActiveIngredient] = useState<string>("")
  const [activeIngredientSearch, setActiveIngredientSearch] = useState<string>("");
  const [categorySearch, setCategorySearch] = useState<string>("");
  const [filteredCategories, setFilteredCategories] = useState<any[]>([]);

  const { loading: gettingAllCatLoading, data, gettingAllCategories } = GetCategories()
  
  const { activeIngredients, loading: gettingAllActiveIngredientsLoading, error: gettingAllActiveIngredientsError, gettingAllActiveIngredients } = useGettingAllActiveIngredient()
  
  const { createProduct, isCreated, loading: creatingProductLoading, error } = useCreateProduct()

  const filteredActiveIngredients = activeIngredients.filter((item: any) =>
    item.name.toLowerCase().includes(activeIngredientSearch.toLowerCase())
  );

  useEffect(() => {
    if (data && data.length > 0) {
      if (categorySearch.trim() === "") {
        setFilteredCategories(data);
      } else {
        const filtered = data.filter((category: any) =>
          category.name.toLowerCase().includes(categorySearch.toLowerCase())
        );
        setFilteredCategories(filtered);
      }
    }
  }, [categorySearch, data]);

  const onSubmit = async () => {
    if (!name.trim()) {
      toast.error(t("nameValidation"));
      return;
    }
    if (!arabicName.trim()) {
      toast.error(t("arabicNameValidation"));
      return;
    }
    if (!preef.trim()) {
      toast.error(t("companyValidation"));
      return;
    }
    if (!description.trim()) {
      toast.error(t("descriptionValidation"));
      return;
    }
    if (!categoryId?.trim()) {
      toast.error(t("categoryValidation"))
      return;
    }
    if (!activeIngredientId?.trim()) {
      toast.error(t("activeIngredientValidation"))
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("arabicName", arabicName);
    formData.append("preef", preef);
    formData.append("description", description);
    formData.append("categoryId", categoryId);
    formData.append("activeIngredientId", activeIngredientId);
    formData.append("image", photo as File);

    try {
      const success = await createProduct(formData)

      if (success) {
        toast.success(t("productCreated"))
        setTimeout(() => {
          router.push("/dashboard/product-list");
        }, 1000);
      }
    } catch (error: any) {
      toast.error(t("productCreationError"));
    }
  }

  useEffect(() => {
    gettingAllCategories()
    gettingAllActiveIngredients()
  }, []);

  useEffect(() => {
    if (data && data.length > 0) {
      setFilteredCategories(data);
    }
  }, [data]);

  if (gettingAllCatLoading == true || gettingAllActiveIngredientsLoading == true) {
    return (
      <div className="w-6 h-6 flex items-center justify-center">
        <Loader2 size={12} />
      </div>
    )
  }

  return (
    <div className=" grid grid-cols-12  gap-4  rounded-lg">
      <div className="col-span-12 space-y-4 ">
        <Card>
          <CardHeader className="border-b border-solid border-default-200 mb-6">
            <CardTitle> {t("productDetails")} </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center flex-wrap">
              <Label className="w-[150px] flex-none" htmlFor="h_Fullname">
                {t("productName")}
              </Label>
              <Input
                id="h_Fullname"
                type="text"
                placeholder={t("productName")}
                value={name}
                onChange={(e) => setName(e?.target?.value)}
              />
            </div>

            <div className="flex items-center flex-wrap">
              <Label className="w-[150px] flex-none" htmlFor="arabicName">
                {t("arabicName")}
              </Label>
              <Input
                id="arabicName"
                type="text"
                placeholder={t("arabicName")}
                value={arabicName}
                onChange={(e) => setArabicName(e?.target?.value)}
              />
            </div>

            <div className="flex items-center flex-wrap">
              <Label className="w-[150px] flex-none" htmlFor="pref">
                {t("company")}
              </Label>
              <Input
                id="pref"
                type="text"
                placeholder={t("company")}
                value={preef}
                onChange={(e) => setPref(e?.target?.value)}
              />
            </div>
            <div className="flex items-center flex-wrap">
              <Label className="w-[150px] flex-none" htmlFor="pref">
                {t("productPhoto")}
              </Label>
              <Input
                id="photo"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setPhoto(file);
                  }
                }}
              />
            </div>

            <div className="flex items-center flex-wrap gap-4 md:gap-0">
              <Label className="w-[131px] md:w-[150px] flex-none">{t("category")}</Label>
              <Select onValueChange={(e) => setCategoryId(e)}>
                <SelectTrigger className="flex-1 cursor-pointer">
                  <SelectValue placeholder={t("selectCategoryPlaceholder")} />
                </SelectTrigger>
                <SelectContent onCloseAutoFocus={(e) => e.preventDefault()}>
                  <div className="px-2 py-1" tabIndex={-1}>
                    <Input
                      placeholder={t("searchCategory") || "Search categories..."}
                      value={categorySearch}
                      onChange={(e) => setCategorySearch(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <SelectGroup>
                    <SelectLabel>{t("category")}</SelectLabel>
                    {filteredCategories.length > 0 ? (
                      filteredCategories.map((category: any) => (
                        <SelectItem
                          key={category.id}
                          value={category.id}
                        >
                          {category.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="null" className="px-2 py-1 text-sm text-muted-foreground">
                        {t("noCategoryFound")}
                      </SelectItem>
                    )}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center flex-wrap gap-4 md:gap-0">
              <Label className="w-[131px] md:w-[150px] flex-none"> {t("activeIngredient")} </Label>
              <Select onValueChange={(value) => setActiveIngredient(value)}>
                <SelectTrigger className="flex-1 cursor-pointer">
                  <SelectValue placeholder={t("selectActiveIngredientPlaceholder")} />
                </SelectTrigger>
                <SelectContent onCloseAutoFocus={(e) => e.preventDefault()}>
                  <div className="px-2 py-1" tabIndex={-1}>
                    <Input
                      placeholder={t("searchActiveIngredient")}
                      value={activeIngredientSearch}
                      onChange={(e) => setActiveIngredientSearch(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <SelectGroup>
                    <SelectLabel> {t("activeIngredient")} </SelectLabel>
                    {filteredActiveIngredients.length > 0 ? (
                      filteredActiveIngredients.map((item: any) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="null" className="px-2 py-1 text-sm text-muted-foreground">
                        {t("noActiveIngredientFound")}
                      </SelectItem>
                    )}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center flex-wrap">
              <Label className="w-[150px] flex-none" htmlFor="desc">
                {t("description")}
              </Label>
              <Textarea
                id="desc"
                placeholder={t("description")}
                value={description}
                onChange={(e) => setDescription(e?.target?.value)}
              />
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="col-span-12 flex justify-end">
        <Button
          className={`cursor-pointer ${creatingProductLoading === true ? "cursor-not-allowed" : ""}`}
          onClick={() => onSubmit()}
          disabled={creatingProductLoading}
        >
          {creatingProductLoading === true ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : t("save")}
        </Button>
      </div>
    </div>
  );
};

export default AddProduct;