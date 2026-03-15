"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {useRouter} from "@/i18n/routing";
import {useParams} from "next/navigation";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {Area, MainArea} from "@/types/areas";
import useGettingAllMainAreas from "@/services/area/gettingAllMainAreas";
import gettingAllMainAreas from "@/services/area/gettingAllMainAreas";
import {Loader2} from "lucide-react";
import useUpdateMainArea from "@/services/area/updateMainArea";
import MapSelector from "@/components/partials/MapSelector/MapSelector";
import useGettingSubAreaById from "@/services/subArea/gettingSubAreaById";
import useUpdateSubArea from "@/services/subArea/updateSubArea";


const EditArea = () => {
  const {loading: mainAreaLoading, mainAreas, getAllMainAreas, error: mainAreaError} = useGettingAllMainAreas()

  const {getSubAreaById, subArea, error: subAreaError, loading: subAreaLoading} = useGettingSubAreaById()

  const {loading: updateAreaLoading, updateMainArea, error: updateAreaError} = useUpdateMainArea()

  const {loading: updateSubAreaLoading, updateSubArea} = useUpdateSubArea()

  const router = useRouter();
  const params = useParams();
  const areaType = params?.areaType as string;
  const areaId = params?.id as string;

  const [name, setName] = useState("");
  const [lat, setLat] = useState("");
  const [lang, setLang] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [mainArea, setMainArea] = useState("");

  const convertToIsActive = (isDeleted: boolean | undefined) => {
 
    return isDeleted === false ? false : true;
  };

  const convertToIsDeleted = (isActive: boolean) => {
  
    return isActive ? true : false;
  };

  useEffect(() => {
    if (mainAreas.length > 0 || subArea != null) {
      if (areaType == "main") {
        const area = mainAreas.find((m: MainArea) => m.id === areaId);
        if (!area) {
          toast.error("Area not found");
          return;
        }

        setName(area.regionName);
        setLat(area.lat || "");
        setLang(area.lang || "");
        setIsActive(convertToIsActive(area.isDeleted));
        setMainArea(""); 
      }

      if (areaType === "secondary") {

        setName(subArea?.name || "");
        setMainArea(subArea?.regionId || "");
        if (subArea?.isDeleted !== undefined) {
          setIsActive(convertToIsActive(subArea.isDeleted));
        }
      }
    }
  }, [mainAreas, subArea]);

  const updateArea = async () => {
    if (!name.trim()) {
      toast.error("Validation Error", { description: "Area Name is required." });
      return;
    }

    if (areaType === "main") {
      if (!lat.trim()) {
        toast.error("Validation Error", { description: "Latitude is required." });
        return;
      }
      if (!lang.trim()) {
        toast.error("Validation Error", { description: "Longitude is required." });
        return;
      }
    }

    if (areaType === "secondary" && !mainArea) {
      toast.error("Validation Error", { description: "Main Area is required." });
      return;
    }

    if (isActive == null) {
      toast.error("Validation Error", { description: "Status is required." });
      return;
    }

    try {
      const isDeleted = convertToIsDeleted(isActive);

      const updateData = {
        regionName: name,
        isDeleted: isDeleted,
        ...(areaType === "main" && { lat, lang }) 
      };

      const {success, error} = areaType === "secondary" ? await updateSubArea(areaId, {
          name,
          regionId: mainArea,
          isDeleted: isDeleted,
      }) : await updateMainArea(areaId, updateData);

      if (success) {
        toast.success("Area Updated", {
          description: "Area updated successfully!",
        });
        setTimeout(() => {
          router.push("/dashboard/area");
        }, 1000);
      }

      if (error) {
        throw new Error(error);
      }
    } catch (error: any) {
      toast.error("Network Error", {
        description: error?.message || "Something went wrong",
      });
    }
  };

  useEffect(() => {
    getAllMainAreas()
    if (areaType === "secondary") {
      getSubAreaById(areaId)
    }
  }, []);

  if (mainAreaLoading || subAreaLoading) {
    return (
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
    )
  }

  return (
      <div className="grid grid-cols-12 gap-4 rounded-lg">
        <div className="col-span-12">
          <Card>
            <CardHeader className="border-b border-solid border-default-200 mb-6">
              <CardTitle>Edit Area</CardTitle>
            </CardHeader>

            {areaType === "secondary" && (
                <CardContent className="space-y-4">
                  <div className="flex items-center flex-wrap">
                    <Label className="w-[150px] flex-none" htmlFor="mainArea">
                      Main Area
                    </Label>
                    <Select
                        value={mainArea}
                        onValueChange={(value) => setMainArea(value)} 
                    >
                      <SelectTrigger id="mainArea" className="flex-1">
                        <SelectValue placeholder="Main Area" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Available Main Areas</SelectLabel>
                          {mainAreas.map((area) => (
                              <SelectItem
                                  key={area.id}
                                  value={area.id || ""}
                              >
                                {area.regionName}
                              </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
            )}

            <CardContent className="space-y-4">
              <div className="flex items-center flex-wrap">
                <Label className="w-[150px] flex-none" htmlFor="areaName">
                  Area Name
                </Label>
                <Input
                    id="areaName"
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
              </div>
            </CardContent>

            {areaType === "main" && (
                <CardContent className="space-y-4">
                  <div className="flex flex-col gap-4">
                    <Label>Pick Location on Map (Egypt)</Label>
                    <div className="flex-1">
                      <MapSelector
                          lat={lat}
                          lang={lang}
                          onChange={(newLat, newLang) => {
                            setLat(newLat);
                            setLang(newLang);
                          }}
                      />
                    </div>
                  </div>
                </CardContent>
            )}

            {/*<CardContent className="space-y-4">*/}
            {/*  <div className="flex items-center flex-wrap">*/}
            {/*    <Label className="w-[150px] flex-none" htmlFor="isActive">*/}
            {/*      Status*/}
            {/*    </Label>*/}
            {/*    <Select*/}
            {/*        value={String(isActive)}*/}
            {/*        onValueChange={(value) => {*/}
            {/*          setIsActive(value === "true");*/}
            {/*        }}*/}
            {/*    >*/}
            {/*      <SelectTrigger id="isActive" className="flex-1">*/}
            {/*        <SelectValue placeholder="Select status" />*/}
            {/*      </SelectTrigger>*/}
            {/*      <SelectContent>*/}
            {/*        <SelectItem value="true">Active</SelectItem>*/}
            {/*        <SelectItem value="false">Inactive</SelectItem>*/}
            {/*      </SelectContent>*/}
            {/*    </Select>*/}
            {/*  </div>*/}
            {/*</CardContent>*/}
          </Card>
        </div>

        <div className="col-span-12 flex justify-center">
          <Button onClick={updateArea} disabled={updateAreaLoading}>
            {updateAreaLoading ? "Updating..." : "Update Area"}
          </Button>
        </div>
      </div>
  );
};

export default EditArea;