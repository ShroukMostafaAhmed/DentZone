"use client";

import dynamic from "next/dynamic";
import {useEffect, useState} from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useRouter } from "@/i18n/routing";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {useParams} from "next/navigation";
import useGettingAllMainAreas from "@/services/area/gettingAllMainAreas";
import useCreateSubArea from "@/services/subArea/createSubArea";
import useCreateMainArea from "@/services/area/CreateMainArea";
import MapSelector from "@/components/partials/MapSelector/MapSelector";
import gettingAllMainAreas from "@/services/area/gettingAllMainAreas";
import {Loader2} from "lucide-react";
const AddArea = () => {
  // getting all main areas

  const {loading: gettingMainAreaLoading, mainAreas, getAllMainAreas} = useGettingAllMainAreas()

  // creating new area (main or secondary)
  const {loading: subAreaLoading, createSubArea} = useCreateSubArea()
  const {loading: mainAreaLoading, createMainArea} = useCreateMainArea()

  const router = useRouter();
  const params = useParams();
  const areaType = params?.areaType as string;

  const [name, setName] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [mainArea, setMainArea] = useState("");
  const [lat, setLat] = useState("");
  const [lang, setLang] = useState("");


  const addArea = async () => {
    if (areaType === "main") {
      if (!name.trim() || !lat.trim() || !lang.trim()) {
        toast.error("Validation Error", {
          description: "Region name, lat, and lang are required.",
        });
        return;
      }

      try {
        const {success, error} =await createMainArea({
          regionName: name,
          lat,
          lang,
        });
        if (error) {
          throw new Error(error || "Failed to create main area");
        }
        toast.success("Main area added!");
        router.push("/dashboard/area");
      } catch (error: any) {
        toast.error("Error", {description: error.message || "Failed to add main area"});
      }
      return;
    }

    // For secondary areas
    if (!name.trim() || !mainArea.trim()) {
      toast.error("Validation Error", {
        description: "Sub-area name and main area are required.",
      });
      return;
    }

    try {
      const {success, error} = await createSubArea({
        name: name,
        regionId: mainArea,
      });
      if (error) {
          throw new Error(error || "Failed to create sub area");
      }
      toast.success("Sub area added!");
      router.push("/dashboard/area");
    } catch (error: any) {
      toast.error("Error", { description: error.message || "Failed to add sub area" });
    }
  };

  useEffect(() => {
    getAllMainAreas()
  }, []);

  if (gettingMainAreaLoading) {
    return (
        <div className="flex items-center justify-center h-screen">
            <Loader2 className="w-6 h-6 animate-spin" />
        </div>
    )
  }

  return (
      <div className="grid grid-cols-12 gap-4 rounded-lg">
        <div className="col-span-12">
          <Card>
            <CardHeader className="border-b border-solid border-default-200 mb-6">
              <CardTitle>Area Information</CardTitle>
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
                                <SelectItem key={area.id} value={area.id as string}>
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

            <CardContent className="space-y-4">
              <div className="flex items-center flex-wrap">
                <Label className="w-[150px] flex-none" htmlFor="isActive">
                  Active
                </Label>
                <Select
                    value={String(isActive)}
                    onValueChange={(value) => setIsActive(value === "true")}
                >
                  <SelectTrigger id="isActive" className="flex-1">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="col-span-12 flex justify-center">
          <Button onClick={addArea} disabled={mainAreaLoading || subAreaLoading } className="w-full max-w-[200px]">
            {mainAreaLoading || subAreaLoading ? "Loading..." : "Add Area"}
          </Button>
        </div>
      </div>
  );
};

export default AddArea;