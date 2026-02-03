import { ColumnDef } from "@tanstack/react-table";
import { SquarePen, Trash2 } from "lucide-react";
import { Link } from "@/i18n/routing";
import { ProductType } from "@/types/product";
import { toast } from "sonner";
import useDeleteProductById from "@/services/products/deleteProductById";
import { Button } from "@/components/ui/button";
import Cookies from "js-cookie";

export const baseColumns = ({
  refresh,
  t,
}: {
  refresh: () => void;
  t: (key: string) => string;
}): ColumnDef<ProductType>[] => {
  const userRole = Cookies.get("userRole");

  // ===== الأعمدة الأساسية =====
  const columns: ColumnDef<ProductType>[] = [
    {
      accessorKey: "name",
      header: t("productName"),
      cell: ({ row }) => (
        <div className="font-medium text-card-foreground/80">
          <span className="text-sm text-default-600">
            {row.original.name ?? t("unknown")}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "arabicName",
      header: t("arabicName"),
      cell: ({ row }) => (
        <div className="font-medium text-card-foreground/80">
          <span className="text-sm text-default-600">
            {row.original.arabicName ?? t("unknown")}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "productCode",
      header: t("productCode"),
      cell: ({ row }) => (
        <div className="font-medium text-card-foreground/80">
          <span className="text-sm text-default-600">
            {row.original.productCode ?? t("unknown")}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "preef",
      header: t("company"),
      cell: ({ row }) => (
        <div className="font-medium text-card-foreground/80">
          <span className="text-sm text-default-600">
            {row.original.preef ?? "unknown"}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "category",
      header: t("category"),
      cell: ({ row }) => <span>{row.original.category.name}</span>,
    },
    {
      accessorKey: "activeIngredient",
      header: t("activeIngredient"),
      cell: ({ row }) => (
        <span>{row.original.activeIngredient?.name ?? t("unknown")}</span>
      ),
    },
  ];

  // ===== إضافة عمود Actions فقط للـ Admin =====
  if (userRole === "Admin") {
    columns.push({
      id: "actions",
      accessorKey: "action",
      header: t("actions"),
      enableHiding: false,
      cell: ({ row }) => {
        const { loading, deleteProductById } = useDeleteProductById();

        const handleDeleteProduct = (id: string | undefined) => {
          const toastId = toast("Delete Product", {
            description: t("areYouWantToRemove"),
            action: (
              <div className="flex justify-end mx-auto items-center my-auto gap-2">
                <Button
                  size="sm"
                  onClick={() => toast.dismiss(toastId)}
                  className="text-white px-3 py-1 rounded-md"
                >
                  {t("cancel")}
                </Button>
                <Button
                  size="sm"
                  variant="shadow"
                  disabled={loading}
                  className="text-white px-3 py-1 rounded-md"
                  onClick={async () => {
                    try {
                      const { success, error } = await deleteProductById(id);
                      toast.dismiss(toastId);
                      if (success) {
                        toast(t("successMessage"));
                        refresh();
                      } else {
                        throw new Error(error);
                      }
                    } catch {
                      toast.dismiss(toastId);
                      toast(t("errorMessage"));
                    }
                  }}
                >
                  {t("remove")}
                </Button>
              </div>
            ),
          });
        };

        return (
          <div className="flex items-center gap-1">
            {/* زر Edit */}
            <Link
              href={`/dashboard/edit-product/${row.original.id}`}
              className="flex items-center p-2 border-b text-info hover:text-info-foreground bg-info/40 hover:bg-info duration-200 transition-all rounded-full"
            >
              <SquarePen className="w-4 h-4" />
            </Link>

            {/* زر Delete */}
            <div
              onClick={() => handleDeleteProduct(row.original.id)}
              className="flex items-center p-2 text-destructive bg-destructive/40 duration-200 transition-all hover:bg-destructive/80 hover:text-destructive-foreground rounded-full"
            >
              <Trash2 className="w-4 h-4" />
            </div>
          </div>
        );
      },
    });
  }

  return columns;
};
