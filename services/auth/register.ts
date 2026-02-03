import AxiosInstance from "@/lib/AxiosInstance";

function useRegister() {
    const registerUser = async (data: any) => {
        console.log("Submitted data", data);
        try {
            const response = await AxiosInstance.post('/api/Users/register', data);

            if (response.status === 200 || response.status === 201) {
                return true;
            } else {
                throw new Error('Registration failed');
            }
        } catch (error) {
            throw error;
        }
    };

    return {
        registerUser,
    };
}

export default useRegister;