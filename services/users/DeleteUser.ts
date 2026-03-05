import { useState } from "react";
import GetUsers from "@/services/users/GetAllUsers";

function useDeleteUser() {
    // جلب دالة التحديث من الـ Hook الخاص بجلب المستخدمين
    const { gettingAllUsers } = GetUsers(); 
    const [loading, setLoading] = useState(false);
    const [isDeleted, setIsDeleted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const deleteUser = async (userId: string | number): Promise<{ success: boolean; error?: string }> => {
        setLoading(true);
        setIsDeleted(false);
        setError(null);

        try {
            // التعديل: استخدام DELETE وإضافة الـ ID في الـ URL مباشرة
            const response = await fetch(`http://dentzone.runasp.net/api/Users/delete-user/${userId}`, {
                method: "DELETE",
                headers: {
                    "Accept": "*/*",
                },
            });

            // التأكد من نجاح العملية (Status 200 أو 204)
            if (response.ok) { 
                // تحديث القائمة تلقائياً بعد الحذف
                if (typeof gettingAllUsers === "function") {
                    gettingAllUsers();
                }
                setIsDeleted(true);
                return { success: true };
            } else {
                const message = await response.text();
                throw new Error(message || "فشل حذف المستخدم");
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