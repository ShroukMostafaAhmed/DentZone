import AxiosInstance from "@/lib/AxiosInstance";
import {useState} from "react";

function useUpdateActiveIngredient() {
    const [loading, setLoading] = useState(false);

    const updateActiveIngredient = async (activeIngredientId: string, updatedData: any): Promise<{ success: boolean; error?: string }> => {
        setLoading(true);
        try {
            const response = await AxiosInstance.put(`/api/ActiveIngerients/${activeIngredientId}`, updatedData);
            if (response.status !== 201) {
                throw new Error('Failed to update active ingredient');
            }
            return { success: true }
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred' }
        } finally {
            setLoading(false);
        }
    }
    return {
        loading,
        updateActiveIngredient
    };
}

export default useUpdateActiveIngredient;