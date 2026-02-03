import {useState} from "react";
import AxiosInstance from "@/lib/AxiosInstance";
import {UserType} from "@/types/users";

function useGettingUserById() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [user, setUser] = useState<UserType | null>(null);

    const getUserById = async (id: string | string[] | undefined) => {
        setLoading(true);
        setError(null);
        await AxiosInstance.get(`/api/Users/user?userid=${id}`).then((response) => {
            if (response.status !== 200) {
                throw new Error('Failed to fetch user');
            }
            setUser(response.data);
        }).catch((error) => {
            setError(error.message);
        }).finally(() => {
            setLoading(false);
        })
    }

    return { user, loading, error, getUserById };
}

export default useGettingUserById;