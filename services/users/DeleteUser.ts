import { useState } from "react";
import GetUsers from "@/services/users/GetAllUsers";

function useDeleteUser() {
    const { gettingAllUsers } = GetUsers(); // Function to refresh user list
    const [loading, setLoading] = useState(false);
    const [isDeleted, setIsDeleted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Deletes a user by ID and refreshes the users list.
     * @param userId - ID of the user to delete
     */
    const deleteUser = async (userId: string | number): Promise<{ success: boolean; error?: string }> => {
        setLoading(true);
        setIsDeleted(false);
        setError(null);

        try {
            const response = await fetch(`/api/Users/delete-user`, {
                method: "POST",
                headers: {
                    "Accept": "text/plain",
                },
                body: JSON.stringify(userId),
            });

            if (response.status === 200 || response.status === 204) {
                gettingAllUsers();
                setIsDeleted(true);
                return { success: true };
            } else {
                const message = await response.text();
                throw new Error(message || "Something went wrong");
            }
        } catch (err: any) {
            setError(err.message);
            setIsDeleted(false);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    return {
        deleteUser,
        isDeleted,
        loading,
        error,
    };
}

export default useDeleteUser;