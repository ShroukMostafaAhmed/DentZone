import {ProductType} from "@/types/product";

export interface ActiveIngredient {
    id?: string;
    name: string;
    products?: ProductType[];
}