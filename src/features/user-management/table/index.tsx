import type { AxiosError } from 'axios';
import type { IErrorResponse } from '@/features/common'; // Assuming this global type
import type { ColumnSort } from '@tanstack/react-table';

import { toast } from 'sonner';
// import { useTranslation } from 'react-i18next';
import React, { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { PlusCircle, X, Calendar as CalendarIcon } from 'lucide-react';

// Shadcn UI Components
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';

import { cn } from '@/lib/utils';
import { format } from 'date-fns';

import { useDebounce } from '@/features/hooks/use-debounce'
import { useModalManager } from '@/components/modal/use-modal-manager';

// Our new Shadcn-based data table
import { DataTable } from '@/components/table/data-table';

import { UserManagementColumns } from './columns';
import { deleteUser, fetchUsers } from '../api';
import { IUserRole } from '../types';

const UserManagementTable = () => {
  const { openContextModal, openAlertModal, closeAllModals } = useModalManager();
  // const { t } = useTranslation();

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  // FIX 1: Default state is now 'ALL'. The state will never be an empty string.
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<Date | null>(null);

  // Table State
  const [sorting, setSorting] = useState<ColumnSort[]>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0, // tanstack-table uses 0-based index
    pageSize: 10,
  });

  const debouncedSearch = useDebounce(searchTerm, 300);

  const queryParams = useMemo(() => {
    return {
      search: debouncedSearch || undefined,
      // FIX 2: If roleFilter is 'ALL', send 'undefined' to the API.
      role: roleFilter === 'ALL' ? undefined : (roleFilter as IUserRole),
      createdAt: dateFilter,
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      sortBy: sorting.length > 0 ? sorting[0].id : undefined,
      order: (
        sorting.length > 0 ? (sorting[0].desc ? 'desc' : 'asc') : undefined
      ) as 'asc' | 'desc' | undefined,
    };
  }, [debouncedSearch, roleFilter, dateFilter, pagination, sorting]);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['userManagement', queryParams],
    queryFn: () => fetchUsers(queryParams),
    refetchOnWindowFocus: false,
  });

  const deleteMutation = useMutation({
    mutationFn: async (userId: string) => deleteUser(userId),
    onSuccess: () => {
      refetch();
      closeAllModals();
      // toast.success(t('user_management.delete_success'));
      toast.success(('Delete Success'));
    },
    onError: (error: AxiosError) => {
      const errorPayload = error?.response?.data as IErrorResponse;
      toast.error(errorPayload?.message ?? 'Failed to delete user');
    },
  });

  const handleClearFilters = () => {
    setSearchTerm('');
    // FIX 3: Reset roleFilter back to 'ALL'
    setRoleFilter('ALL');
    setDateFilter(null);
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
          <div className="flex flex-col md:flex-row gap-2 flex-wrap">
            {/* Search Filter */}
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-[250px]"
            />
            {/* Role Filter */}
            <Select
              // FIX 4: The value is now just roleFilter
              value={roleFilter}
              // FIX 5: onValueChange simply sets the state.
              onValueChange={(value) => setRoleFilter(value)}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Roles</SelectItem>
                {Object.values(IUserRole).map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* Date Filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full md:w-[240px] justify-start text-left font-normal',
                    !dateFilter && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFilter ? format(dateFilter, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dateFilter ?? undefined}
                  onSelect={(date: Date | undefined) => {
                    setDateFilter(date ?? null);
                  }}
                  required={false}
                  autoFocus
                />
              </PopoverContent>
            </Popover>
            {/* Clear Filters */}
            <Button variant="ghost" onClick={handleClearFilters}>
              <X className="mr-2 h-4 w-4" /> Clear
            </Button>
          </div>
          {/* Add User Button */}
          <Button
            onClick={() => {
              openContextModal({
                modal: 'userAction',
                title: 'Add User',
                innerProps: {
                  type: 'create',
                  onSuccess: () => {
                    refetch();
                  },
                },
              });
            }}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>

        <DataTable
          columns={UserManagementColumns({
            onEditClick: (user) => {
              openContextModal({
                modal: 'userAction',
                // title: t('user_management.update_user'),
                title: 'Delete User',
                innerProps: {
                  type: 'edit',
                  user,
                  onSuccess: () => {
                    refetch();
                  },
                },
              });
            },
            onDeleteClick: (user) => {
              openAlertModal({
                // title: t('user_management.delete_title'),
                title: 'Delete User',
                description: `Are you sure you want to delete ${user.name}?`,
                onConfirm: () => {
                  deleteMutation.mutate(user.id);
                },
                confirmVariant: 'default', // Use this to style the confirm button
              });
            },
          })}
          data={data?.data ?? []}
          pageCount={data?.totalSize ? Math.ceil(data.totalSize / pagination.pageSize) : 0}
          isLoading={isLoading}
          pagination={pagination}
          onPaginationChange={setPagination}
          sorting={sorting}
          onSortingChange={setSorting}
        />
      </CardContent>
    </Card>
  );
};

export default UserManagementTable;

// import { useState, useMemo } from "react"
// import { useQuery } from "@tanstack/react-query"
// import {
//   useReactTable,
//   getCoreRowModel,
//   getFilteredRowModel,
//   getPaginationRowModel,
//   getSortedRowModel,
//   type ColumnDef,
//   type ColumnFiltersState,
//   type SortingState,
//   type VisibilityState,
// } from "@tanstack/react-table"
// import { Input } from "@/components/ui/input"
// import { Button } from "@/components/ui/button"
// import {
//   DropdownMenu,
//   DropdownMenuCheckboxItem,
//   DropdownMenuContent,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu"
// import { DataTable } from "@/components/table/data-table"
// import { useDebounce } from "@/features/hooks/use-debounce"
// import { fetchUsers } from "../api"
// import { createUserManagementColumns } from "./columns"
// import { SlidersHorizontal } from "lucide-react"
// import type { IUserManagement } from "../types"

// const UserManagementTable = () => {
//   const [searchTerm, setSearchTerm] = useState('');
//   const debouncedSearch = useDebounce(searchTerm, 500);

//   const { data: users, isLoading, error } = useQuery({
//     queryKey: ['users', debouncedSearch],
//     queryFn: () => fetchUsers({ search: debouncedSearch }),
//   });

//   const columns = useMemo(
//     () =>
//       createUserManagementColumns({
//         // onEditClick: (user) => handleOpenModal('edit', user),
//         // onDeleteClick: (user) => handleOpenDeleteAlert(user),
//       }),
//     []
//   );

//   const [sorting, setSorting] = useState<SortingState>([])
//   const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
//     []
//   )
//   const [columnVisibility, setColumnVisibility] =
//     useState<VisibilityState>({})
//   const [rowSelection, setRowSelection] = useState({})

//   const table = useReactTable({
//     data: users ?? [],
//     columns: columns as ColumnDef<IUserManagement, unknown>[],
//     onSortingChange: setSorting,
//     onColumnFiltersChange: setColumnFilters,
//     getCoreRowModel: getCoreRowModel(),
//     getPaginationRowModel: getPaginationRowModel(),
//     getSortedRowModel: getSortedRowModel(),
//     getFilteredRowModel: getFilteredRowModel(),
//     onColumnVisibilityChange: setColumnVisibility,
//     onRowSelectionChange: setRowSelection,
//     state: {
//       sorting,
//       columnFilters,
//       columnVisibility,
//       rowSelection,
//     },
//   });

//   return (
//     <div className="w-full">
//       <div className="flex items-center justify-between mb-4">
//         <div className="flex items-center gap-2">
//           <Input
//             placeholder="Search by name or email..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="max-w-sm"
//           />
//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <Button variant="outline" size="icon">
//                 <SlidersHorizontal className="h-4 w-4" />
//                 <span className="sr-only">Toggle columns</span>
//               </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent align="end">
//               {table
//                 .getAllColumns()
//                 .filter((column) => column.getCanHide())
//                 .map((column) => {
//                   return (
//                     <DropdownMenuCheckboxItem
//                       key={column.id}
//                       className="capitalize"
//                       checked={column.getIsVisible()}
//                       onCheckedChange={(value) =>
//                         column.toggleVisibility(!!value)
//                       }
//                     >
//                       {column.id}
//                     </DropdownMenuCheckboxItem>
//                   )
//                 })}
//             </DropdownMenuContent>
//           </DropdownMenu>
//         </div>
//         <Button>Add User</Button>
//       </div>
//       <DataTable table={table} />
//     </div>
//   );
// };

// export default UserManagementTable;