"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/routing";
import { useParams } from "next/navigation";
import useGetCategoryById from "@/services/categories/getCategoryById";
import Loader from "@/components/loader";
import useUpdateCategoryById from "@/services/categories/UpdateCatergory";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import useGettingAllMainCategories from "@/services/MainCategories/gettingAllMainCategories";
import {Loader2} from "lucide-react";
import { useTranslations } from "next-intl";

const EditCategory = () => {
  // Router navigator
  const router = useRouter();

  // Params
  const params = useParams();
  const id = params?.id;

  // Translation
  const t = useTranslations("categories");

  // API Call
  const { category, gettingCategoryById, loading: categoryLoading } = useGetCategoryById();
  const { updatingCategoryById, loading: updatingCategoryLoading} = useUpdateCategoryById()
  const {mainCategories, loading: mainCategoriesLoading, getAllMainCategories, error: mainCategoriesError} = useGettingAllMainCategories()

  // Form states
  const [name, setName] = useState("");
  const [arabicName, setArabicName] = useState("");
  const [pref, setPref] = useState("");
  const [description, setDescription] = useState("");
  const [module, setModule] = useState("");

  // Call the API to get category by ID
  useEffect(() => {
    if (id) gettingCategoryById(id);
  }, [id]);

  // When the category data is loaded, populate the form
  useEffect(() => {
    if (category) {
      setName(category.name || "");
      setArabicName(category.arabicName || "");
      setPref(category.pref || "");
      setDescription(category.description || "");
      setModule(category.mainCategoryId?.toString() || "");
    }
  }, [category]);

  // If category is undefined after loading is done, show error
  useEffect(() => {
    if (!categoryLoading && !category) {
      toast.error("Something went wrong", {
        description: "Please, reload the page"
      });
      setTimeout(() => {
        router.push('/dashboard/categories');
      }, 2000);
    }
  }, [categoryLoading, category]);

  // Handle update (you'd normally call an update API here)
  const updateCategory = async () => {
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

    // Simulate update success (replace with real update logic)
    const  {success, error} = await updatingCategoryById(id, { name, pref, mainCategoryId: module, description, arabicName });
    if ( success ) {
      toast.success(t("category_updated"), {
        description: t("category_updated_success")
      });
      setTimeout(() => {
        router.push('/dashboard/categories');
      }, 2000);
    } else if (error) {
      toast.error( t("failed_to_update_category"))
      setTimeout(() => {
        router.push('/dashboard/categories');
      }, 2000);
    }
  };

  useEffect(() => {
    getAllMainCategories();
  }, []);

  if (categoryLoading || mainCategoriesLoading) {
    return (
      <div className=" h-[20%] flex items-center justify-center flex-col space-y-2">
        <Loader2 className="h-6 w-6 animate-spin" />
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
              <div className="flex items-center flex-wrap">
                <Label className="w-[150px] flex-none" htmlFor="category-id">{t("Module_Name")} </Label>
                {mainCategories.length > 0 && (
                    <Select value={module} onValueChange={(value) => setModule(value)}>
                      <SelectTrigger className="flex-1 cursor-pointer">
                        <SelectValue placeholder={t("Module_Name")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {mainCategories.map((module) => (
                              <SelectItem key={module.id} value={module.id}>
                                {module.name}
                              </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                )}
              </div>
            </CardContent>

            <CardContent className="space-y-4">
              <div className="flex items-center flex-wrap">
                <Label className="w-[150px] flex-none" htmlFor="category-name"> {t("category_name")}</Label>
                <Input
                    id="category-name"
                    type="text"
                    placeholder={t("category_name")}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
              </div>
            </CardContent>

            <CardContent className="space-y-4">
              <div className="flex items-center flex-wrap">
                <Label className="w-[150px] flex-none" htmlFor="category-arabic-name"> {t("category_arabic_name")} </Label>
                <Input
                    id="category-arabic-name"
                    type="text"
                    placeholder={t("category_arabic_name")}
                    value={arabicName}
                    onChange={(e) => setArabicName(e.target.value)}
                />
              </div>
            </CardContent>

            <CardContent className="space-y-4">
              <div className="flex items-center flex-wrap">
                <Label className="w-[150px] flex-none" htmlFor="category-pref">{t("pref")}</Label>
                <Input
                    id="category-pref"
                    type="text"
                    placeholder={t("pref")}
                    value={pref}
                    onChange={(e) => setPref(e.target.value)}
                />
              </div>
            </CardContent>

            <CardContent className="space-y-4">
              <div className="flex items-center flex-wrap">
                <Label className="w-[150px] flex-none" htmlFor="category-description">{t("description")}</Label>
                <Textarea
                    id="category-description"
                    placeholder={t("description")}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-12 flex justify-center">
          <Button onClick={updateCategory}>
            {updatingCategoryLoading ? (
                <div className="flex flex-row gap-3 items-center">
                  <Loader2 className="w-6 h-6" />
                </div>
            ) : (
                t("update_category")
            )}
          </Button>
        </div>
      </div>
  );
};

export default EditCategory;