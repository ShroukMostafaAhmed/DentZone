import {useState} from "react";
import AxiosInstance from "@/lib/AxiosInstance";

function useCreateActiveIngredients() {
    const [loading, setLoading] = useState(false);

    const createActiveIngredient = async (activeIngredientData: any): Promise<{ success: boolean; error?: string }> => {
        setLoading(true);
        try {
            const response = await AxiosInstance.post('/api/ActiveIngerients', activeIngredientData);
            if (response.status !== 201) {
                throw new Error('Failed to create active ingredient');
            }
            return { success: true };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred' };
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        createActiveIngredient
    };
}

export default useCreateActiveIngredients;