"use client";

import { useEffect, useState, ChangeEvent, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useParams } from "next/navigation";
import { useRouter } from "@/i18n/routing";
import { toast } from "sonner";
import { Loader2, Upload, FileImage } from "lucide-react";
import { useTranslations } from "next-intl";

// Hooks
import useGettingProductById from "@/services/products/gettingProductById";
import GetCategories from "@/services/categories/getCategories";
import useUpdateProductById from "@/services/products/UpdateProductById";

const EditProduct = () => {
  const t = useTranslations("productList");
  const router = useRouter();
  const params = useParams();
  const productId = params?.id as string;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { getProductById, product, loading } = useGettingProductById();
  const { data: categories, gettingAllCategories, loading: catsLoading } = GetCategories();
  const { updatingProductById, loading: updateLoading } = useUpdateProductById();

  const [formData, setFormData] = useState({
    name: "",
    arabicName: "",
    pref: "",
    description: "",
    categoryId: "",
    image: null as File | null,
  });

  useEffect(() => {
    gettingAllCategories();
    if (productId) getProductById(productId);
  }, [productId]);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        arabicName: product.arabicName || "",
        pref: product.preef || "",
        description: product.description || "",
        // حماية من الـ Runtime Error عبر Optional Chaining
        categoryId: product.category?.id ? String(product.category.id) : "",
        image: null, 
      });
    }
  }, [product]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFormData({ ...formData, image: e.target.files[0] });
    }
  };

  const handleUpdate = async () => {
    // التحقق من الحقول الأساسية فقط (بدون Active Ingredient)
    if (!formData.name || !formData.categoryId) {
      toast.error(t("fill_all_fields"));
      return;
    }

    // تجهيز البيانات كـ FormData بناءً على Swagger
    const data = new FormData();
    data.append("Name", formData.name);
    data.append("ArabicName", formData.arabicName);
    data.append("Preef", formData.pref);
    data.append("Description", formData.description);
    data.append("CategoryId", formData.categoryId);
    
    if (formData.image) {
      data.append("Photo", formData.image); 
    }

    try {
      const { success } = await (updatingProductById as any)(productId, data);
      if (success) {
        toast.success(t("Product updated successfully"));
        router.push('/dashboard/product-list');
      }
    } catch (error) {
      toast.error(t("productUpdateError"));
    }
  };

  if (loading || catsLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-4 rounded-lg">
      <div className="col-span-12">
        <Card>
          <CardHeader className="border-b border-default-200 mb-6">
            <CardTitle>{t("productDetails")}</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Arabic Name */}
            <div className="flex items-center flex-wrap gap-2">
              <Label className="w-[180px] flex-none text-sm font-medium">{t("arabicName")}</Label>
              <Input 
                className="flex-1 min-w-[300px]"
                placeholder={t("arabicName")}
                value={formData.arabicName} 
                onChange={(e) => setFormData({...formData, arabicName: e.target.value})} 
              />
            </div>

            {/* Product Name */}
            <div className="flex items-center flex-wrap gap-2">
              <Label className="w-[180px] flex-none text-sm font-medium">{t("productName")}</Label>
              <Input 
                className="flex-1 min-w-[300px]"
                placeholder={t("productName")}
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
              />
            </div>

            {/* Product Preference */}
            <div className="flex items-center flex-wrap gap-2">
              <Label className="w-[180px] flex-none text-sm font-medium">{t("productPref")}</Label>
              <Input 
                className="flex-1 min-w-[300px]"
                placeholder={t("productPref")}
                value={formData.pref} 
                onChange={(e) => setFormData({...formData, pref: e.target.value})} 
              />
            </div>

            <div className="flex items-center flex-wrap gap-2">
              <Label className="w-[180px] flex-none text-sm font-medium">{t("productPhoto")}</Label>
              <div className="flex-1 min-w-[300px] flex items-center gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <FileImage className="w-4 h-4 mr-2" />
                  {t("chooseFile") || "Choose File"}
                </Button>
                <span className="text-sm text-muted-foreground truncate">
                  {formData.image ? formData.image.name : "No file chosen"}
                </span>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                />
              </div>
            </div>

            {/* Category Select */}
            <div className="flex items-center flex-wrap gap-2">
              <Label className="w-[180px] flex-none text-sm font-medium">{t("category")}</Label>
              <Select 
                value={formData.categoryId} 
                onValueChange={(val) => setFormData({...formData, categoryId: val})}
              >
                <SelectTrigger className="flex-1 min-w-[300px]">
                  <SelectValue placeholder={t("selectCategory")} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat: any) => (
                    <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="flex items-start flex-wrap gap-2">
              <Label className="w-[180px] flex-none text-sm font-medium mt-3">{t("description")}</Label>
              <Textarea 
                className="flex-1 min-w-[300px]"
                placeholder={t("description")}
                value={formData.description} 
                onChange={(e) => setFormData({...formData, description: e.target.value})} 
              />
            </div>

          </CardContent>
        </Card>
      </div>

      <div className="col-span-12 flex justify-center mt-6">
        <Button onClick={handleUpdate} disabled={updateLoading} className="w-full max-w-[200px] gap-2">
          {updateLoading ? <Loader2 className="animate-spin h-4 w-4" /> : <Upload className="h-4 w-4" />}
          {t("updateProduct")}
        </Button>
      </div>
    </div>
  );
};

export default EditProduct;