import AxiosInstance from "@/lib/AxiosInstance";
import {useState} from "react";

function useDeleteActiveIngredientById() {
    const [loading, setLoading] = useState(false);

    const deleteActiveIngredientById = async (activeIngredientId: string): Promise<{ success: boolean; error?: string }> => {
        setLoading(true);
        try {
            const response = await AxiosInstance.delete(`/api/ActiveIngerients/${activeIngredientId}`);
            if (response.status !== 204) {
                throw new Error('Failed to delete active ingredient');
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
        deleteActiveIngredientById
    };
}

export default useDeleteActiveIngredientById;