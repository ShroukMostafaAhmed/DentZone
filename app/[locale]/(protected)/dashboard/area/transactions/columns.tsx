import { ColumnDef } from "@tanstack/react-table";
import { MainArea } from "@/types/areas";
import { Link, usePathname } from "@/i18n/routing";
import { SquarePen } from "lucide-react";
import useToggleStatusSubArea from "@/services/subArea/toggleStatusSubArea";
import useToggleAreaStatus from "@/services/area/toggleAreaStatus";
import { toast } from "sonner"; // or your preferred toast library
// import { useToast } from "@/components/ui/use-toast"; // if using shadcn/ui toast

interface GetColumnsProps {
  areaType: "main" | "secondary";
  onRefresh?: () => void; // Function to refresh the table data
}

export const getColumns = ({ areaType, onRefresh }: GetColumnsProps): ColumnDef<MainArea>[] => [
  {
    accessorKey: areaType === "secondary" ? "name" : "regionName",
    header: "Name",
    cell: ({ row }) => {
      const isSecondary = areaType === "secondary";
      return (
          <div className="capitalize">
            <Link
                href={`/dashboard/area/${areaType === "main" ? "main" : "secondary"}/${row.original.id}`}
                className="hover:underline"
            >
              {isSecondary ? row.getValue("name") : row.getValue("regionName")}
            </Link>
          </div>
      );
    },
  },
  {
    accessorKey: "isDeleted",
    header: "Is Active",
    cell: ({ row }) => {
      const isDeleted = row.getValue("isDeleted");
      const isActive = !isDeleted;
      const label = isActive ? "Active" : "Inactive";
      const badgeColor = isActive
          ? "bg-green-100 text-green-800"
          : "bg-red-100 text-red-800";

      return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeColor}`}>
          {label}
        </span>
      );
    },
  },
  {
    accessorKey: "id",
    header: "Toggle Area Status",
    cell: ({ row }) => {
      const id: string = row.getValue("id");

      const { loading: toggleSubAreaLoading, toggleStatusSubArea } = useToggleStatusSubArea();
      const { loading: toggleMainAreaLoading, toggleAreaStatus } = useToggleAreaStatus();

      const isDeleted = row.getValue("isDeleted");
      const isActive = !isDeleted;
      const isLoading = areaType === "main" ? toggleMainAreaLoading : toggleSubAreaLoading;

      const handleToggleStatus = async () => {
        try {
          let result;

          if (areaType === "main") {
            result = await toggleAreaStatus(id);
          } else {
            result = await toggleStatusSubArea(id);
          }

          if (result.success && onRefresh) {
            onRefresh();
            // Success toast
            toast.success(
                `${areaType === "main" ? "Area" : "Sub-area"} status ${isActive ? "deactivated" : "activated"} successfully!`
            );
          } else {
            // Error toast
            toast.error(
                result.error || `Failed to ${isActive ? "deactivate" : "activate"} ${areaType === "main" ? "area" : "sub-area"}`
            );
          }
        } catch (error) {
          // Catch any unexpected errors
          toast.error("An unexpected error occurred. Please try again.");
          console.error("Toggle status error:", error);
        }
      };

      return (
          <button
              onClick={handleToggleStatus}
              disabled={isLoading}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors cursor-pointer ${
                  isActive == true || isActive == null
                      ? "bg-red-100 text-red-700 hover:bg-red-200 disabled:bg-red-50"
                      : "bg-green-100 text-green-700 hover:bg-green-200 disabled:bg-green-50"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isLoading ? "Loading..." : isActive == true || isActive == null ? "Click to deactivate" : "Click to activate"}
          </button>
      );
    },
  },
  {
    id: "actions",
    accessorKey: "action",
    header: "Actions",
    enableHiding: false,
    cell: ({ row }) => {
      const pathname = usePathname();
      const getHref = () => {
        if (pathname?.includes('/area')) {
          return `/dashboard/edit-area/${areaType}/${row.original.id}`;
        }
        return `/dashboard/edit-area/${areaType}/${row.original.id}`;
      };

      return (
          <div className="flex items-center space-x-2">
            <Link
                href={getHref()}
                className="p-2 text-blue-300 hover:text-blue-100 bg-blue-100 hover:bg-blue-300 rounded-full transition-colors"
            >
              <SquarePen className="h-4 w-4" />
            </Link>
          </div>
      );
    },
  },
];