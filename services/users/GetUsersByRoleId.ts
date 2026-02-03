import {useState} from 'react';
import AxiosInstance from "@/lib/AxiosInstance";

function useGetUsersByRoleId() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [users, setUsers] = useState([]);

    const getUsersByRoleId = async (roleId: string | string[] | undefined) => {
        setLoading(true);
        await AxiosInstance.get(`/api/Users/by-role/${roleId}`).then((response) => {
            if (response.status !== 200 && response.status !== 201) {
                throw new Error('Network response was not ok');
            }
            setUsers(response.data);
        }).catch ((error) => {
            setError(error);
        }).finally(() => {
            setLoading(false);
        })
    };

    return {
        loading,
        error,
        users,
        getUsersByRoleId
    }
}

export default useGetUsersByRoleId;