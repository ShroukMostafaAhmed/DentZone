"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import useGettingAllSubAreasOfArea from "@/services/area/gettingAllSubAreasOfArea";
import useGettingAllUsersInRegion from "@/services/area/gettingAllusersInRegion";
import { Loader2 } from "lucide-react";

const AreaDetails = () => {
    const area = useParams();

    const { loading: subAreaLoading, subAreas, getAllSubAreasOfArea } = useGettingAllSubAreasOfArea();
    const { loading: mainAreaUsersLoading, users, getAllUsersInRegion } = useGettingAllUsersInRegion();

    useEffect(() => {
        if (area?.areaType === "main") {
            getAllSubAreasOfArea(area?.id);
        }

        getAllUsersInRegion(area?.id);
    }, []);

    return (
        <>
            {/* Sub Areas Table */}
            {area?.areaType == "main" && (
                <>
                    {subAreaLoading  ? (
                        <div className="flex justify-center items-center my-6">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : subAreas?.length > 0 ? (
                        <Card className="p-4 my-4">
                            <h2 className="text-lg font-semibold mb-4">Sub Areas</h2>
                            <table className="w-full table-auto border border-gray-300">
                                <thead>
                                <tr className="bg-gray-100">
                                    {/*<th className="p-2 border">ID</th>*/}
                                    <th className="p-2 border">Name</th>
                                    <th className="p-2 border">Is Active?</th>
                                    {/*<th className="p-2 border">Latitude</th>*/}
                                    {/*<th className="p-2 border">Longitude</th>*/}
                                </tr>
                                </thead>
                                <tbody>
                                {subAreas.map((area: any) => (
                                    <tr key={area.id}>
                                        {/*<td className="p-2 border">{area.id}</td>*/}
                                        <td className="p-2 border text-center">{area.name}</td>
                                        <td className="p-2 border text-center">
                                            {area.isDeleted ? (
                                                <span className="inline-block px-2 py-1 text-xs font-semibold leading-none text-white transform bg-red-600 rounded-full">
                                                    Inactive
                                                </span>
                                            ) : (
                                                <span className="inline-block px-2 py-1 text-xs font-semibold leading-none text-white transform bg-green-600 rounded-full">
                                                    Active
                                                </span>
                                            )}
                                        </td>
                                        {/*<td className="p-2 border">{area.latitude}</td>*/}
                                        {/*<td className="p-2 border">{area.longitude}</td>*/}
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </Card>
                    ) : (
                        <p className="text-center my-4 text-sm text-muted-foreground">No sub-areas found.</p>
                    )}
                </>
            )}

            {/* Users Table */}
            {mainAreaUsersLoading ? (
                <div className="flex justify-center items-center my-6">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
            ) : users?.length > 0 ? (
                <Card className="p-4 my-4">
                    <h2 className="text-lg font-semibold mb-4">Users in Region</h2>
                    <table className="w-full table-auto border border-gray-300">
                        <thead>
                        <tr className="bg-gray-100">
                            {/*<th className="p-2 border">ID</th>*/}
                            <th className="p-2 border">Name</th>
                            <th className="p-2 border">Email</th>
                            {/*<th className="p-2 border">Role</th>*/}
                        </tr>
                        </thead>
                        <tbody>
                        {users.map((user: any) => (
                            <tr key={user.id}>
                                {/*<td className="p-2 border">{user.id}</td>*/}
                                <td className="p-2 border text-center">{user.userName}</td>
                                <td className="p-2 border text-center">{user.email}</td>
                                {/*<td className="p-2 border">{user.role}</td>*/}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </Card>
            ) : (
                <p className="text-center my-4 text-sm text-muted-foreground">No users found.</p>
            )}
        </>
    );
};

export default AreaDetails;