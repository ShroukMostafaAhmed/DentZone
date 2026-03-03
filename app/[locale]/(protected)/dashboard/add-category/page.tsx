"use client";

import { useEffect, useState, ChangeEvent, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useRouter } from "@/i18n/routing";
import useCreateCategory from "@/services/categories/CreateCategory";
import { Loader2, Upload, FileImage } from "lucide-react"; 
import { useTranslations } from "next-intl";

const AddCategory = () => {
  const { creatingCategory, loading } = useCreateCategory();
  const router = useRouter();
  const t = useTranslations("categories");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // States
  const [name, setName] = useState("");
  const [arabicName, setArabicName] = useState("");
  const [pref, setPref] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const addCategory = async () => {
    // التحقق من الحقول المطلوبة بناءً على الـ Swagger
    if (!name.trim() || !arabicName.trim() || !pref.trim() || !description.trim()) {
      toast.error(t("validationError"), { description: t("fill_all_fields") });
      return;
    }

    // إعداد البيانات كـ FormData لدعم رفع الملفات
    const formData = new FormData();
    formData.append("Name", name);
    formData.append("ArabicName", arabicName);
    formData.append("Pref", pref);
    formData.append("Description", description);
    
    if (imageFile) {
      formData.append("ImageFile", imageFile);
    }

    try {
      // إرسال الـ formData مباشرة (استخدام any لتجنب تعارض أنواع TypeScript مع الـ Hook)
      const success = await (creatingCategory as any)(formData);
      
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

  return (
    <div className="grid grid-cols-12 gap-4 rounded-lg">
      <div className="col-span-12">
        <Card>
          <CardHeader className="border-b border-solid border-default-200 mb-6">
            <CardTitle>{t("category_Information")} </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            
            {/* Arabic Name */}
            <div className="flex items-center flex-wrap gap-2">
              <Label className="w-[180px] flex-none text-sm font-medium" htmlFor="categoryArabicName">
                {t("category_arabic_name")}
              </Label>
              <Input
                id="categoryArabicName"
                className="flex-1 min-w-[300px]"
                placeholder={t("category_arabic_name")}
                value={arabicName}
                onChange={(e) => setArabicName(e.target.value)}
              />
            </div>

            {/* English Name */}
            <div className="flex items-center flex-wrap gap-2">
              <Label className="w-[180px] flex-none text-sm font-medium" htmlFor="categoryName">
                {t("category_name")}
              </Label>
              <Input
                id="categoryName"
                className="flex-1 min-w-[300px]"
                placeholder={t("category_name")}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Preference */}
            <div className="flex items-center flex-wrap gap-2">
              <Label className="w-[180px] flex-none text-sm font-medium" htmlFor="categoryPref">
                {t("pref")}
              </Label>
              <Input
                id="categoryPref"
                className="flex-1 min-w-[300px]"
                placeholder={t("pref")}
                value={pref}
                onChange={(e) => setPref(e.target.value)}
              />
            </div>

            {/* Description */}
            <div className="flex items-start flex-wrap gap-2">
              <Label className="w-[180px] flex-none text-sm font-medium mt-3" htmlFor="categoryDescription">
                {t("description")}
              </Label>
              <Textarea
                id="categoryDescription"
                className="flex-1 min-w-[300px]"
                placeholder={t("description")}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Image Upload - تم التعديل ليطابق الحقول السابقة تماماً */}
            <div className="flex items-center flex-wrap gap-2">
              <Label className="w-[180px] flex-none text-sm font-medium" htmlFor="imageFile">
                {t("category_image")}
              </Label>
              <div className="flex-1 min-w-[300px] flex items-center gap-3">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex gap-2 items-center"
                >
                  <FileImage className="w-4 h-4" />
                  Choose File
                </Button>
                
                <span className="text-sm text-muted-foreground truncate">
                  {imageFile ? imageFile.name : "No file chosen"}
                </span>

                <input
                  ref={fileInputRef}
                  id="imageFile"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>

          </CardContent>
        </Card>
      </div>

      <div className="col-span-12 flex justify-center mt-4">
        <Button onClick={addCategory} disabled={loading} className="w-full max-w-[200px] gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Upload className="w-4 h-4"/>}
          {t("add_category")}
        </Button>
      </div>
    </div>
  );
};

export default AddCategory;