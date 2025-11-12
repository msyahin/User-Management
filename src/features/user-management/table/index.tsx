import type { AxiosError } from 'axios';
import type { IErrorResponse } from '@/features/common';
import type { ColumnSort } from '@tanstack/react-table';

import { toast } from 'sonner';
import { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  PlusCircle,
  X,
} from 'lucide-react';

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
import { Card, CardContent } from '@/components/ui/card';

import { useDebounce } from '@/features/hooks/use-debounce';
import { useModalManager } from '@/components/modal/use-modal-manager';

import { DataTable } from '@/components/table/data-table';

import { UserManagementColumns } from './columns';
import { deleteUser, fetchUsers } from '../api';
import { IUserRole } from '../types';

const UserManagementTable = () => {
  const { openContextModal, openAlertModal, closeAllModals } = useModalManager();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  const [sorting, setSorting] = useState<ColumnSort[]>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const debouncedSearch = useDebounce(searchTerm, 300);

  const queryParams = useMemo(() => {
    return {
      search: debouncedSearch || undefined,
      role: roleFilter === 'ALL' ? undefined : (roleFilter as IUserRole),
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      sortBy: sorting.length > 0 ? sorting[0].id : undefined,
      order: (
        sorting.length > 0 ? (sorting[0].desc ? 'desc' : 'asc') : undefined
      ) as 'asc' | 'desc' | undefined,
    };
  }, [debouncedSearch, roleFilter, pagination, sorting]);

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
      toast.success('Delete Success');
    },
    onError: (error: AxiosError) => {
      const errorPayload = error?.response?.data as IErrorResponse;
      toast.error(errorPayload?.message ?? 'Failed to delete user');
    },
  });

  const handleClearFilters = () => {
    setSearchTerm('');
    setRoleFilter('ALL');
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
              value={roleFilter}
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
                title: 'Delete User',
                description: `Are you sure you want to delete ${user.name}?`,
                onConfirm: () => {
                  deleteMutation.mutate(user.id);
                },
                confirmVariant: 'default',
              });
            },
            onViewBioClick: (user) => {
              openAlertModal({
                title: `${user.name}'s Bio`,
                description: (
                  <p className="max-h-[300px] overflow-y-auto whitespace-pre-wrap break-words">
                    {user.bio || 'No bio provided.'}
                  </p>
                ),
                confirmText: 'OK',
                onConfirm: () => closeAllModals(),
                cancelText: 'Close',
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