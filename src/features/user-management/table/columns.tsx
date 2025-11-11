import dayjs from 'dayjs';
import type { ColumnDef, SortDirection } from '@tanstack/react-table';
import { MoreHorizontal, ArrowUpDown, Edit, Trash2 } from 'lucide-react';

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

import { formatStr } from '@/utils/format-time'
import { type IUserManagement, IUserRole } from '../types';

interface IUserManagementColumns {
  onEditClick: (user: IUserManagement) => void;
  onDeleteClick: (user: IUserManagement) => void;
}

// Custom header component for sorting
const SortableHeader = ({
  label,
  column,
}: {
  label: string;
  column: any;
}) => {
  const sortDir = column.getIsSorted() as SortDirection | false;

  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(sortDir === 'asc')}
    >
      {label}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );
};

export const UserManagementColumns = ({
  onEditClick,
  onDeleteClick,
}: IUserManagementColumns): ColumnDef<IUserManagement>[] => {
  // const { t } = useTranslation();

  return [
    {
      accessorKey: 'name',
      header: ({ column }) => <SortableHeader label="Name" column={column} />, // [cite: 41]
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={row.original.avatar} alt={row.original.name} />
            <AvatarFallback>
              {row.original.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium">{row.original.name}</span>
        </div>
      ),
    },
    {
      accessorKey: 'email',
      header: ({ column }) => <SortableHeader label="Email" column={column} />, // [cite: 41]
    },
    {
      accessorKey: 'phoneNumber',
      header: 'Phone Number', // [cite: 30]
    },
    {
      accessorKey: 'role',
      header: 'Role', // [cite: 31]
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
      header: 'Status', // [cite: 32]
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
        <SortableHeader label="Creation Date" column={column} /> // [cite: 41]
      ),
      cell: ({ row }) => (
        <span>{dayjs(row.original.createdAt).format(formatStr.paramCase.date)}</span>
      ),
    },
    {
      accessorKey: 'bio',
      header: 'Bio', // [cite: 34]
      cell: ({ row }) => (
        <p className="max-w-[200px] truncate" title={row.original.bio}>
          {row.original.bio}
        </p>
      ),
    },
    {
      accessorKey: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
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
      ),
    },
  ];
};
