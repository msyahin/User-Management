import { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DataTable } from "@/components/table/data-table"
import { useDebounce } from "@/features/hooks/use-debounce"
import { fetchUsers } from "../../features/user-management/api"
import { createUserManagementColumns } from "../../features/user-management/columns"
import { SlidersHorizontal } from "lucide-react"
import type { IUserManagement } from "../../features/user-management/types"
import { useModalManager } from "@/components/modal/use-modal-manager"

const UserManagementPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);

  const { openContextModal } = useModalManager();

  const { data: users, isLoading, error } = useQuery({
    queryKey: ['users', debouncedSearch],
    queryFn: () => fetchUsers({ search: debouncedSearch }),
  });

  const columns = useMemo(
    () =>
      createUserManagementColumns({
        // onEditClick: (user) => handleOpenModal('edit', user),
        // onDeleteClick: (user) => handleOpenDeleteAlert(user),
      }),
    []
  );

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})

  const table = useReactTable({
    data: users ?? [],
    columns: columns as ColumnDef<IUserManagement, unknown>[],
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
        <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">User Management</h1>
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <SlidersHorizontal className="h-4 w-4" />
                <span className="sr-only">Toggle columns</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Button
          onClick={() => 
            openContextModal({
              modal: 'userAction',
              title: 'Add User',
              innerProps: {},
            })
          }
        >
          Add User
        </Button>
      </div>
      <DataTable table={table} />
    </div>
    </div>
  );
};

export default UserManagementPage;