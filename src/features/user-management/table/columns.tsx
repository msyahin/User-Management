import dayjs from 'dayjs';
import type { ColumnDef, SortDirection } from '@tanstack/react-table';
import {
  MoreHorizontal,
  ArrowUpDown,
  Edit,
  Trash2,
  FileText,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

// Shadcn UI Components
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

import { formatStr } from '@/utils/format-time';
import { type IUserManagement, IUserRole } from '../types';

interface IUserManagementColumns {
  onEditClick: (user: IUserManagement) => void;
  onDeleteClick: (user: IUserManagement) => void;
  onViewBioClick: (user: IUserManagement) => void;
}

const SortableHeader = ({
  label,
  column,
}: {
  label: string;
  column: any;
}) => {
  const sortDir = column.getIsSorted() as SortDirection | false;

  const SortIcon = () => {
    if (sortDir === 'asc') {
      return <ArrowUp className="h-4 w-4 text-foreground" />;
    }
    if (sortDir === 'desc') {
      return <ArrowDown className="h-4 w-4 text-foreground" />;
    }
    return <ArrowUpDown className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <div
      className="flex items-center gap-1 cursor-pointer select-none"
      onClick={() => column.toggleSorting(sortDir === 'asc')}
    >
      {label}
      <SortIcon />
    </div>
  );
};

export const UserManagementColumns = ({
  onEditClick,
  onDeleteClick,
  onViewBioClick,
}: IUserManagementColumns): ColumnDef<IUserManagement>[] => {

  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: 'avatar',
      header: () => null,
      cell: ({ row }) => (
        <Avatar>
          <AvatarImage src={row.original.avatar} alt={row.original.name} />
          <AvatarFallback>
            {row.original.name.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      ),
    },
    {
      accessorKey: 'name',
      header: ({ column }) => <SortableHeader label="Name" column={column} />, 
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
    },
    {
      accessorKey: 'email',
      header: ({ column }) => <SortableHeader label="Email" column={column} />, 
    },
    {
      accessorKey: 'phoneNumber',
      header: 'Phone Number', 
    },
    {
      accessorKey: 'role',
      header: 'Role', 
      cell: ({ row }) => {
        const role = row.original.role;
        const variant: 'default' | 'secondary' | 'outline' =
          role === IUserRole.ADMIN
            ? 'default'
            : role === IUserRole.USER
              ? 'secondary'
              : 'outline';
        return <Badge variant={variant}>{role}</Badge>;
      },
    },
    {
      accessorKey: 'active',
      header: 'Status', 
      cell: ({ row }) => {
        const status = row.original.active ? 'Active' : 'Inactive';
        const variant: 'default' | 'destructive' = row.original.active
          ? 'default'
          : 'destructive';
        return <Badge variant={variant}>{status}</Badge>;
      },
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <SortableHeader label="Creation Date" column={column} /> 
      ),
      cell: ({ row }) => (
        <span>{dayjs(row.original.createdAt).format(formatStr.paramCase.date)}</span>
      ),
    },
    {
      accessorKey: 'bio',
      header: 'Bio', 
      cell: ({ row }) => (
        <p className="max-w-[200px] truncate" title={row.original.bio}>
          {row.original.bio}
        </p>
      ),
    },
    {
      accessorKey: 'actions',
      header: () => <div className="text-center">Actions</div>,
      cell: ({ row }) => (
        <div className="flex justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {row.original.bio && (
                <DropdownMenuItem
                  onClick={() => onViewBioClick(row.original)}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  View Bio
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => onEditClick(row.original)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => onDeleteClick(row.original)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];
};
