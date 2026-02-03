"use client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useController } from "react-hook-form";
import { Controller, useForm, SubmitHandler } from "react-hook-form";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import useRegister from "@/services/auth/register";
import {toast} from "sonner";
import {Cookie, Loader2} from "lucide-react";
import Cookies from "js-cookie";
import useGettingAllMainAreas from "@/services/area/gettingAllMainAreas";
import {useEffect} from "react";
import gettingAllMainAreas from "@/services/area/gettingAllMainAreas";
import useGettingAllSubArea from "@/services/subArea/gettingAllSubArea";
import useGettingAllSubAreasOfArea from "@/services/area/gettingAllSubAreasOfArea";
import useGettingActiveAreas from "@/services/area/gettingActiveAreas";

type Inputs = {
    BussinesName: string;
    IsPharmacy: boolean;
    IsActive: boolean;
    UserName: string;
    NomalizedUserName: string;
    Email: string;
    EmailConfirmed: boolean;
    Password: string;
    PhoneNumber: string;
    PhoneConfirmed: boolean;
    RegionName: string;
    DesName: string;
    GovId: string;
    City: string;
    MinOrder: number;
    RoleId: string;
    PharmacyDetails: null;
    RegionId: string;
};

const RegForm = () => {
    const {registerUser} = useRegister()
    const {loading: loadingSubAreas, error: errorSubAreas, getAllSubAreasOfArea, subAreas} = useGettingAllSubAreasOfArea()

    const {loading, activeAreas, getActiveAreas, error} = useGettingActiveAreas()

    const userRole = Cookies.get("userRole");
    
    const {
        register,
        handleSubmit,
        watch,
        control,
        setValue
    } = useForm<Inputs>({
        defaultValues: {
            IsActive: true,
            EmailConfirmed: true,
            PhoneConfirmed: true,
            PharmacyDetails: null,
            RegionName: "",
            DesName: "",
            GovId: "",
            City: "",
        },
    });

    const onSubmit: SubmitHandler<Inputs> = async (data) => {
        try {
            const formData = new FormData();


            data.City = "";

            // Append all fields manually
            Object.entries(data).forEach(([key, value]) => {
                if (value != null) {
                    formData.append(key, value.toString());
                }
            });

            // Call the registerUser with formData
            const result = await registerUser(formData); // You must adjust registerUser to accept FormData

            if (result) {
                toast.success("Registration successful!");
                // reset the whole form
                setValue("BussinesName", "");
                setValue("UserName", "");
                setValue("Email", "");
                setValue("Password", "");
                setValue("PhoneNumber", "");
                setValue("NomalizedUserName", "");
                setValue("RoleId", "");
                setValue("PhoneNumber", "");
                setValue("RegionName", "");
                setValue("DesName", "");
                setValue("GovId", "");
                setValue("City", "");
                setValue("MinOrder", 0);
                setValue("IsPharmacy", false);
                setValue("IsActive", true);
                setValue("EmailConfirmed", true);
                setValue("PhoneConfirmed", true);
                setValue("PharmacyDetails", null);
            }
        } catch (error) {
            toast.error("Registration failed. Please try again.");
            console.error("Registration error:", error);
        }
    };

    useEffect(() => {
        getActiveAreas()
    }, []);

    // dependent data
    useEffect(() => {
        const subscription = watch((value, { name }) => {
            if (name === "City" && value.City) {
                getAllSubAreasOfArea(value.City);
            }
        });

        return () => subscription.unsubscribe(); // Clean up the subscription
    }, [watch]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="w-6 h-6 animate-spin" />
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Phone */}
            <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" placeholder="02123456789" {...register("PhoneNumber")} />
            </div>

            {/* Business Name */}
            <div className="space-y-2">
                <Label htmlFor="businessName">Business Name</Label>
                <Input id="businessName" placeholder="Business Name" {...register("BussinesName")} />
            </div>

            {/* User Name */}
            <div className="space-y-2">
                <Label htmlFor="userName">Username</Label>
                <Input id="userName" {...register("UserName")} onChange={(e) => {
                    const value = e.target.value;
                    setValue("UserName", value);
                    setValue("NomalizedUserName", value.toLowerCase());
                }} />
            </div>

            {/* Email */}
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register("Email")} />
            </div>

            {/* Password */}
            <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                    id="password"
                    type="password"
                    placeholder="Password"
                    {...register("Password", { required: true })}
                />
            </div>

            {/* User Type */}
            <div className="space-y-2">
                <Controller
                    name="RoleId"
                    control={control}
                    render={({ field }) => (
                        <>
                            <Label htmlFor="userType">User Type</Label>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="E48E5A9F-2074-4DE9-A849-5C69FDD45E4E">Pharmacy</SelectItem>
                                    {userRole == "Admin" && (
                                        <>
                                            <SelectItem value="1A5A84FB-23C3-4F9B-A122-4C5BC6C5CB2D">Inventory Manager</SelectItem>
                                            <SelectItem value="8C2F4F3A-7F6D-4DB8-8B02-4A04D31F35D6">Admin</SelectItem>
                                        </>
                                    )}
                                </SelectContent>
                            </Select>
                        </>
                    )}
                />
            </div>

            {/* Region Name */}
            <div className="space-y-2">
                <Controller
                    name="City"
                    control={control}
                    render={({ field }) => (
                        <>
                            <Label htmlFor="regionName">Region</Label>
                            <Select
                                onValueChange={(selectedRegionId) => {
                                    field.onChange(selectedRegionId);
                                    const selectedRegion = activeAreas.find((area) => area.id === selectedRegionId);
                                    setValue("RegionId", selectedRegion?.id || ""); // optional: for display
                                    setValue("RegionName", selectedRegion?.regionName || ""); // optional: for display
                                    getAllSubAreasOfArea(selectedRegionId); // fetch cities of this region
                                }}
                                value={field.value}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a region" />
                                </SelectTrigger>
                                <SelectContent>
                                    {activeAreas.map((area) => (
                                        <SelectItem key={area.id} value={area.id as string}>
                                            {area.regionName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </>
                    )}
                />
            </div>

            {subAreas.length > 0 && !loadingSubAreas ? (
                <div className="space-y-2">
                    <Controller
                        name="GovId" // now stores city id
                        control={control}
                        render={({ field }) => (
                            <>
                                <Label htmlFor="city">City</Label>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a city" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {subAreas.map((area) => (
                                            <SelectItem key={area.id} value={area.id as string}>
                                                {area.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </>
                        )}
                    />
                </div>
            ) : (
                loadingSubAreas && (
                    <div className="flex items-center justify-center h-[15px]">
                        <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                )
            )}

            {/* Min Order */}
            <div className="space-y-2">
                <Label htmlFor="minOrder">Min Order</Label>
                <Input id="minOrder" type="number" placeholder="Min Order" {...register("MinOrder")} />
            </div>

            {/* Description Name */}
            <div className="space-y-2">
                <Label htmlFor="desName">Des Name</Label>
                <Input id="desName" placeholder="Des Name" {...register("DesName")} />
            </div>

            {/*is Pharmacy*/}
            <div className="flex flex-row gap-4 justify-center items-center ">
                <Label htmlFor="isPharmacy">Is Pharmacy</Label>
                <Input type={"checkbox"} className="w-4 h-4"  id="isPharmacy" {...register("IsPharmacy")} />
            </div>

            {/*/!* Confirm Terms *!/*/}
            {/*<div className="flex gap-2 items-center">*/}
            {/*    <Checkbox id="terms" defaultChecked />*/}
            {/*    <Label htmlFor="terms">*/}
            {/*        You Accept Our Terms And Conditions And Privacy Policy*/}
            {/*    </Label>*/}
            {/*</div>*/}

            <Button type="submit" fullWidth>
                Create An Account
            </Button>
        </form>
    );
};

export default RegForm;