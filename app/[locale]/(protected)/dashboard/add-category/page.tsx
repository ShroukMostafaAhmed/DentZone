"use client";

import {useEffect, useState} from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useRouter } from "@/i18n/routing";
import useCreateCategory from "@/services/categories/CreateCategory";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import useGettingAllMainCategories from "@/services/MainCategories/gettingAllMainCategories";
import {Loader2} from "lucide-react";
import { useTranslations } from "next-intl";

const AddCategory = () => {
  const { creatingCategory, loading } = useCreateCategory()
  const router = useRouter();
  const t = useTranslations("categories")

  // getting all main Categories
  const {loading: mainCategoriesLoading, mainCategories, getAllMainCategories, error: mainCategoriesError} = useGettingAllMainCategories()

  const [name, setName] = useState("");
  const [arabicName, setArabicName] = useState("");
  const [pref, setPref] = useState("");
  const [description, setDescription] = useState("");
  const [module, setModule] = useState("");

  const addCategory = async () => {
    if (!name.trim()) {
      toast.error(t("validationError"), { description: t("category_name_required") });
      return;
    }
    if (!arabicName.trim()) {
      toast.error(t("validationError"), { description: t("category_arabic_name_required") });
      return;
    }
    if (!pref.trim()) {
      toast.error(t("validationError"), { description: t("category_pref_required") });
      return;
    }
    if (!description.trim()) {
      toast.error(t("validationError"), { description: t("category_description_required") });
      return;
    }

    try {
      const success = await creatingCategory({ name,arabicName, mainCategoryId: module , pref, description });
      if (success) {
        toast.success(t("category_added"), {
          description: t("category_added_success"),
        });
        setTimeout(() => {
          router.push("/dashboard/categories");
        }, 1000);
      }
    } catch (error: any) {
      toast.error(t("failed_to_add_category"));
    }
  };

  useEffect(() => {
    getAllMainCategories()
  }, []);

  if(mainCategoriesLoading) {
    return (
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="animate-spin h-6 w-6 text-gray-500" />
        </div>
    );
  }

  return (
      <div className="grid grid-cols-12 gap-4 rounded-lg">
        <div className="col-span-12">
          <Card>
            <CardHeader className="border-b border-solid border-default-200 mb-6">
              <CardTitle>{t("category_Information")} </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center">
                <Label className="w-[150px] flex-none" htmlFor="module">
                  {t("Module_Name")}
                </Label>
                <Select onValueChange={(value) => setModule(value)}>
                  <SelectTrigger id="module" className="felx-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {mainCategories.map((module) => (
                        <SelectItem key={module.id} value={module.id}>
                          {module.name || module.arabicName}
                        </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>

            <CardContent className="space-y-4">
              <div className="flex items-center flex-wrap">
                <Label className="w-[150px] flex-none" htmlFor="categoryArabicName">
                  {t("category_arabic_name")}
                </Label>
                <Input
                    id="categoryArabicName"
                    type="text"
                    placeholder={t("category_arabic_name")}
                    value={arabicName}
                    onChange={(e) => setArabicName(e.target.value)}
                />
              </div>
            </CardContent>

            <CardContent className="space-y-4">
              <div className="flex items-center flex-wrap">
                <Label className="w-[150px] flex-none" htmlFor="categoryName">
                  {t("category_name")}
                </Label>
                <Input
                    id="categoryName"
                    type="text"
                    placeholder={t("category_name")}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
              </div>
            </CardContent>
            <CardContent className="space-y-4">
              <div className="flex items-center flex-wrap">
                <Label className="w-[150px] flex-none" htmlFor="categoryPref">
                  {t("pref")}
                </Label>
                <Input
                    id="categoryPref"
                    type="text"
                    placeholder={t("pref")}      
                    value={pref}
                    onChange={(e) => setPref(e.target.value)}
                />
              </div>
            </CardContent>
            <CardContent className="space-y-4">
              <div className="flex items-center flex-wrap">
                <Label className="w-[150px] flex-none" htmlFor="categoryDescription">
                  {t("description")}
                </Label>
                <Textarea
                    id="categoryDescription"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="col-span-12 flex justify-center">
          <Button onClick={addCategory} disabled={loading}>
            {loading ? <Loader2 className="w-6 h-6"/> : t("add_category")}
          </Button>
        </div>
      </div>
  );
};

export default AddCategory;