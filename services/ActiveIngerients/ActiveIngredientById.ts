import {ActiveIngredient} from "@/types/activeIngredient";
import {useState} from "react";
import AxiosInstance from "@/lib/AxiosInstance";

function useActiveIngredientById() {
    const [loading, setLoading] = useState(false);
    const [activeIngredient, setActiveIngredient] = useState<ActiveIngredient | null>(null);

    const gettingActiveIngredientById = async (activeIngredientId: string): Promise<{ success: boolean; error?: string }> => {
        setLoading(true);
        try {
            const response = await AxiosInstance.get(`/api/ActiveIngerients/${activeIngredientId}`);
            if (response.status !== 200) {
                throw new Error('Failed to get active ingredient by id');
            }
            setActiveIngredient(response.data);
            return { success: true }
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred' }
        } finally {
            setLoading(false);
        }
    }
    return {
        loading,
        activeIngredient,
        gettingActiveIngredientById
    };
}

export default useActiveIngredientById;