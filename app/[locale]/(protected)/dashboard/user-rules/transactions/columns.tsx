import { ColumnDef } from "@tanstack/react-table";
import { SquarePen, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import useDeleteUser from "@/services/users/DeleteUser";
import { Link } from "@/i18n/routing";

export type DataProps = {
  id: string | number;
  fullName: string;
  email: string;
  phoneNumber: string;
  businessName: string;
  isPharmacy: boolean;
  regionName: string;
  isActive: boolean;
  action: React.ReactNode;
  addresses?: any;
};

export const baseColumns = ({ refresh }: { refresh: () => void }): ColumnDef<DataProps>[] => [
  {
    accessorKey: "fullName",
    header: "Full Name",
    cell: ({ row }) => <div className="text-sm text-default-600">{row.original.fullName}</div>,
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => <div className="text-sm text-default-600">{row.original.email}</div>,
  },
  {
    accessorKey: "phoneNumber",
    header: "Phone Number",
    cell: ({ row }) => <div className="text-sm text-default-600">{row.original.phoneNumber}</div>,
  },
  {
    accessorKey: "isActive",
    header: "Active",
    cell: ({ row }) => {
      const isActive = row.original.isActive;
      return (
        <div className={`text-sm ${isActive ? "text-success" : "text-destructive"}`}>
          {isActive ? "Yes" : "No"}
        </div>
      );
    },
  },
  // {
  //   accessorKey: "addresses",
  //   header: "Address",
  //   cell: ({ row }) => {
  //     const addr = row.original.addresses;
  //     if (addr && typeof addr === "object") {
  //       return <div className="text-sm text-default-600">{addr.addressLine || "N/A"}</div>;
  //     }
  //     return <div className="text-sm text-default-600">{addr || "N/A"}</div>;
  //   },
  // },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const id = row.original.id;
      const { deleteUser, loading } = useDeleteUser();

      const handleDelete = () => {
        const toastId = toast("Delete User", {
          description: "Are you sure you want to delete this user?",
          action: (
            <div className="flex justify-end items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => toast.dismiss(toastId)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                color="destructive"
                disabled={loading}
                className="text-white bg-destructive hover:bg-destructive/90"
                onClick={async () => {
                  const result = await deleteUser(id);
                  toast.dismiss(toastId);

                  if (result.success) {
                    toast.success("User deleted successfully");
                    if (refresh) refresh(); 
                  } else {
                    toast.error(result.error || "Error deleting user");
                  }
                }}
              >
                {loading ? "Deleting..." : "Confirm"}
              </Button>
            </div>
          ),
        });
      };

      return (
        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/edit-user/${id}`}
            className="p-2 text-info bg-info/20 hover:bg-info hover:text-white rounded-full transition-all"
          >
            <SquarePen className="w-4 h-4" />
          </Link>
          <button
            onClick={handleDelete}
            className="p-2 text-destructive bg-destructive/20 hover:bg-destructive hover:text-white rounded-full transition-all cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      );
    },
  },
];