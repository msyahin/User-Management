import type { AxiosError } from 'axios';
import type { IErrorResponse } from '@/features/common';
import type { ColumnSort, RowSelectionState } from '@tanstack/react-table';

import { toast } from 'sonner';
import { useState, useMemo, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  PlusCircle,
  Trash2,
  X,
} from 'lucide-react';

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
import { deleteUser, fetchUsers, createUser } from '../api';
import { IUserRole, type IUserManagement } from '../types';
import type { Dayjs } from 'dayjs';
import DatePickerButton from '@/components/date-picker';

const UserManagementTable = () => {
  const queryClient = useQueryClient();
  const { openContextModal, openAlertModal, closeAllModals } = useModalManager();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  const [sorting, setSorting] = useState<ColumnSort[]>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const pendingDeletionRef = useRef<{ users: IUserManagement[]; expiry: number } | null>(null);
  const undoTimerRef = useRef<number | null>(null);

  const debouncedSearch = useDebounce(searchTerm, 300);

  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);

  const isFiltered =
    searchTerm !== '' ||
    roleFilter !== 'ALL' ||
    startDate !== null ||
    endDate !== null ||
    sorting.length > 0;

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
      startDate: startDate || undefined,
      endDate: endDate || undefined
    };
  }, [debouncedSearch, roleFilter, pagination, sorting, startDate, endDate]);

  const { data, isLoading } = useQuery({
    queryKey: ['userManagement', queryParams],
    queryFn: () => fetchUsers(queryParams),
    refetchOnWindowFocus: false,
  });

  const deleteMutation = useMutation({
    mutationFn: async (userId: string) => deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userManagement'] });
      closeAllModals();
      toast.success('Delete Success');
    },
    onError: (error: AxiosError) => {
      const errorPayload = error?.response?.data as IErrorResponse;
      toast.error(errorPayload?.message ?? 'Failed to delete user');
    },
  });

  const deleteMultipleMutation = useMutation({
    mutationFn: async (userIds: string[]) => {
      for (const userId of userIds) {
        await deleteUser(userId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userManagement'] });
      closeAllModals();
      setRowSelection({});
      toast.success('All selected users deleted successfully');
    },
    onError: (error: AxiosError) => {
      const errorPayload = error?.response?.data as IErrorResponse;
      toast.error(errorPayload?.message ?? 'Failed to delete users');
      queryClient.invalidateQueries({ queryKey: ['userManagement'] });
    },
  });

  const restoreUsersMutation = useMutation({
    mutationFn: async (users: IUserManagement[]) => {
      for (const user of users) {
        const { id, ...userData } = user;
        await createUser(userData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userManagement'] });
      toast.success('Users restored successfully');
    },
    onError: (error: AxiosError) => {
      const errorPayload = error?.response?.data as IErrorResponse;
      toast.error(errorPayload?.message ?? 'Failed to restore users');
    },
  });

  const commitPendingDeletion = () => {
    if (pendingDeletionRef.current) {
      deleteMultipleMutation.mutate(pendingDeletionRef.current.users.map((u) => u.id));
      pendingDeletionRef.current = null;
      sessionStorage.removeItem('pendingDeletion');
      if (undoTimerRef.current) {
        clearTimeout(undoTimerRef.current);
        undoTimerRef.current = null;
      }
    }
  };

  const handleBulkDelete = () => {
    commitPendingDeletion();

    const selectedIndexes = Object.keys(rowSelection).map(Number);
    const usersToDelete = selectedIndexes.map((index) => (data?.data ?? [])[index]).filter(Boolean) as IUserManagement[];
    if (usersToDelete.length === 0) return;

    const expiry = Date.now() + 5000;
    pendingDeletionRef.current = { users: usersToDelete, expiry };
    sessionStorage.setItem('pendingDeletion', JSON.stringify({ users: usersToDelete, expiry }));

    queryClient.setQueryData(['userManagement', queryParams], (oldData: any) => ({
      ...oldData,
      data: oldData.data.filter((user: IUserManagement) => !usersToDelete.find((u) => u.id === user.id)),
    }));

    toast.info(`${usersToDelete.length} users deleted.`, {
      action: {
        label: 'Undo',
        onClick: () => {
          if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
          pendingDeletionRef.current = null;
          sessionStorage.removeItem('pendingDeletion');
          queryClient.setQueryData(['userManagement', queryParams], (oldData: any) => ({
            ...oldData,
            data: [...oldData.data, ...usersToDelete],
          }));
          toast.success('Deletion undone.');
        },
      },
    });

    undoTimerRef.current = setTimeout(commitPendingDeletion, 5000);
  };

  useEffect(() => {
    const stored = sessionStorage.getItem('pendingDeletion');
    if (stored) {
      const { users, expiry } = JSON.parse(stored);
      const remainingTime = expiry - Date.now();

      if (remainingTime > 0) {
        pendingDeletionRef.current = { users, expiry };
        undoTimerRef.current = setTimeout(commitPendingDeletion, remainingTime);
        toast.info(`${users.length} users pending deletion.`, {
          action: {
            label: 'Undo',
            onClick: () => {
              if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
              pendingDeletionRef.current = null;
              sessionStorage.removeItem('pendingDeletion');
              restoreUsersMutation.mutate(users);
            },
          },
        });
      } else {
        commitPendingDeletion();
      }
    }

    return () => {
      if (undoTimerRef.current) {
        clearTimeout(undoTimerRef.current);
      }
      commitPendingDeletion();
    };
  }, []);

  const handleClearFilters = () => {
    setSearchTerm('');
    setRoleFilter('ALL');
    setStartDate(null);
    setEndDate(null);
    setSorting([]);
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
              <SelectTrigger className="w-full md:w-auto">
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
            {/* Date Filters */}
            <DatePickerButton
              startDate={startDate}
              endDate={endDate}
              setStartDate={setStartDate}
              setEndDate={setEndDate} />
            {/* Clear Filters */}
            {isFiltered && (
              <Button variant="outline" onClick={handleClearFilters}>
                <X className="mr-2 h-4 w-4" /> Clear
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            {Object.keys(rowSelection).length > 0 && (
              <Button
                variant="destructive"
                onClick={() => {
                  openAlertModal({
                    title: 'Delete Users',
                    description: `Are you sure you want to delete ${Object.keys(rowSelection).length} selected users?`,
                    onConfirm: () => {
                      handleBulkDelete();
                      closeAllModals();
                    },
                    confirmVariant: 'default',
                  });
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete ({Object.keys(rowSelection).length})
              </Button>
            )}
            {/* Add User Button */}
            <Button
              onClick={() => {
                openContextModal({
                modal: 'userAction',
                title: 'Add User',
                innerProps: {
                  type: 'create',
                  onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: ['userManagement'] });
                  },
                },
              });
              }}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </div>
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
                    queryClient.invalidateQueries({ queryKey: ['userManagement'] });
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
                showCancel: false,
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
          rowSelection={rowSelection}
          onRowSelectionChange={setRowSelection}
        />
      </CardContent>
    </Card>
  );
};

export default UserManagementTable;
