import { Price } from "@/types/price";
import { CategoryType } from "@/types/category";
import { ActiveIngredient } from "@/types/activeIngredient";

export type ProductType = {
    id?: string,
     productCode: string;
    productName: string;
     productArabicName?: string;
    name: string,
    arabicName?: string,
    preef: string,
    arabicPreef?: string,
    description: string,
    category: CategoryType,
    activeIngredient: ActiveIngredient,
    image: any,
    prices?: Price[]
}