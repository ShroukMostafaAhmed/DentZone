import { ColumnDef } from "@tanstack/react-table";
import { SquarePen, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from '@/i18n/routing';
import { Badge } from "@/components/ui/badge";
import {toast} from "sonner";
import {Button} from "@/components/ui/button";
import useDeleteUser from "@/services/users/DeleteUser";

export type DataProps = {
  [x: string]: any;
  id: string | number;
  phoneNumber: string;
  userName: string;
  date: string;
  email: string;
  amount: string;
  rating: number;
  action: React.ReactNode;
  isPharmacy: boolean;
  regionName: string;
  pharmacyDetails: {
    arabicName: string;
    englishName: string;
    phoneNumber: string;
    fullName: string;
  }
};
export const baseColumn = ({t, refresh} : {
  t: (key: string) => string;
  refresh?: () => void;
}) : ColumnDef<DataProps>[] => [
  {
    accessorKey: "fullName",
    header: t("fullName"),
    cell: ({ row }) => {
      const user = row.original.fullName;
      return (
        <div className="font-medium text-card-foreground/80">
          <div className="flex gap-3 items-center">
            <span className="text-sm text-default-600 whitespace-nowrap">
              {user ?? t("unknown")}
            </span>
          </div>
        </div>
      );
    },
  },
  // {
  //   accessorKey: "phone",
  //   header: "Phone",
  //   cell: ({ row }) => <span>{row.getValue("phone")}</span>,
  // },
  {
    accessorKey: "email",
    header: t("email"),
    cell: ({ row }) => <span>{row.getValue("email")}</span>,
  },
  // {
  //   accessorKey: "pharmacyDetails",
  //   header: t("arabicName"),
  //   cell: ({ row }) => {
  //     return <span> {row.original?.pharmacyDetails?.arabicName || "N/A"}</span>;
  //   },
  // },
  // {
  //   accessorKey: "pharmacyDetails",
  //   header: t("englishName"),
  //   cell: ({ row }) => {
  //     return <span> {row.original?.pharmacyDetails?.englishName || "N/A"}</span>;
  //   },
  // },
  {
    accessorKey: "phoneNumber",
    header: t("phoneNumber"),
    cell: ({ row }) => {
      return <span> {row.original.phoneNumber || "N/A"}</span>;
    },
  },
  {
    accessorKey: "addresses",
    header: t("addresses"),
    cell: ({ row }) => {
      const addresses = row.original.addresses;
      if (Array.isArray(addresses)) {
        return <span>{addresses.map((addr: any) => addr?.addressLine || "").join(", ") || "N/A"}</span>;
      }
      return <span>{addresses?.addressLine || "N/A"}</span>;
    },
  },
  // {
  //   id: "actions",
  //   accessorKey: "action",
  //   header: t("actions"),
  //   enableHiding: false,
  //   cell: ({ row }) => {
  //     const { deleteUser, loading } = useDeleteUser();

  //     const handleDelete = () => {
  //       const toastId = toast("Delete User", {
  //         description: "Are you sure you want to delete this user?",
  //         action: (
  //             <div className="flex justify-end mx-auto items-center my-auto gap-2">
  //               <Button
  //                   size="sm"
  //                   onClick={() => toast.dismiss(toastId)}
  //                   className="text-white px-3 py-1 rounded-md"
  //               >
  //                 Cancel
  //               </Button>
  //               <Button
  //                   size="sm"
  //                   variant="shadow"
  //                   disabled={loading}
  //                   className="text-white px-3 py-1 rounded-md"
  //                   onClick={async () => {
  //                     const result = await deleteUser(row.original.id);
  //                     toast.dismiss(toastId);

  //                     if (result.success) {
  //                       toast("User deleted", {
  //                         description: "The user was deleted successfully.",
  //                       });
  //                       refresh?.();
  //                     } else {
  //                       toast("Error", {
  //                         description: result.error ?? "There was an error deleting the user.",
  //                       });
  //                     }
  //                   }}
  //               >
  //                 Confirm
  //               </Button>
  //             </div>
  //         ),
  //       });
  //     };

  //     return (
  //       <div className="flex items-center gap-1">
  //         <Link
  //           href={`/dashboard/edit-user/${row.original.id}`}
  //           className="flex items-center p-2 border-b text-info hover:text-info-foreground bg-info/20 hover:bg-info duration-200 transition-all rounded-full"
  //         >
  //           <SquarePen className="w-4 h-4" />
  //         </Link>
  //         <div
  //             onClick={handleDelete}
  //             className="flex items-center p-2 text-destructive bg-destructive/40 duration-200 transition-all hover:bg-destructive/80 hover:text-destructive-foreground rounded-full cursor-pointer"
  //         >
  //           <Trash2 className="w-4 h-4" />
  //         </div>
  //       </div>
  //     );
  //   },
  // },
];
