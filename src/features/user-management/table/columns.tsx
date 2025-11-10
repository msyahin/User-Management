import dayjs from 'dayjs';
// import { useTranslation } from 'react-i18next';
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
import { type IUserManagement, IUserRole, IUserStatus } from '../types';

interface IUserManagementColumns {
  // onEditClick: (user: IUserManagement) => void;
  // onDeleteClick: (user: IUserManagement) => void;
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
  // onEditClick,
  // onDeleteClick,
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
        const status = row.original.active
          ? IUserStatus.ACTIVE
          : IUserStatus.INACTIVE;
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
            // onClick={() => onEditClick(row.original)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600"
              // onClick={() => onDeleteClick(row.original)}
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

// "use client"

// import type { ColumnDef } from "@tanstack/react-table"
// import type { IUserManagement } from "@/features/user-management/types"
// import { Button } from "@/components/ui/button"
// import { ArrowUpDown, MoreHorizontal, Edit, Trash2 } from "lucide-react"
// import { Checkbox } from "@/components/ui/checkbox"
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu"

// interface UserManagementColumnsProps {
//   // onEditClick: (user: IUserManagement) => void;
//   // onDeleteClick: (user: IUserManagement) => void;
// }

// export const createUserManagementColumns = ({
//   // onEditClick,
//   // onDeleteClick,
// }: UserManagementColumnsProps): ColumnDef<IUserManagement>[] => [
//     {
//       id: 'select',
//       header: ({ table }) => (
//         <Checkbox
//           checked={
//             table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')
//           }
//           onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
//           aria-label="Select all"
//         />
//       ),
//       cell: ({ row }) => (
//         <Checkbox
//           checked={row.getIsSelected()}
//           onCheckedChange={(value) => row.toggleSelected(!!value)}
//           aria-label="Select row"
//         />
//       ),
//       enableSorting: false,
//       enableHiding: false,
//     },
//     {
//       accessorKey: "name",
//       header: ({ column }) => (
//         <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
//         >
//           Name
//           <ArrowUpDown className="ml-2 h-4 w-4" />
//         </Button>
//       ),
//     },
//     {
//       accessorKey: "email",
//       header: ({ column }) => (
//         <Button
//           variant="ghost"
//           onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
//         >
//           Email
//           <ArrowUpDown className="ml-2 h-4 w-4" />
//         </Button>
//       ),
//     },
//     {
//       accessorKey: "phoneNumber",
//       header: "Phone Number",
//     },
//     {
//       accessorKey: "role",
//       header: "Role",
//     },
//     {
//       accessorKey: "active",
//       header: "Status",
//     },
//     {
//       accessorKey: "createdAt",
//       header: ({ column }) => {
//         return (
//           <Button
//             variant="ghost"
//             onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
//           >
//             Creation Date
//             <ArrowUpDown className="ml-2 h-4 w-4" />
//           </Button>
//         )
//       },
//     },
//     {
//       id: "actions",
//       enableHiding: false,
//       cell: ({ row }) => {
//         const user = row.original

//         return (
//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <Button variant="ghost" className="h-8 w-8 p-0">
//                 <span className="sr-only">Open menu</span>
//                 <MoreHorizontal className="h-4 w-4" />
//               </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent align="end">
//               <DropdownMenuLabel>Actions</DropdownMenuLabel>
//               {/* <DropdownMenuItem onClick={() => onEditClick(user)}>
//                 <Edit className="mr-2 h-4 w-4" />
//                 Edit User
//               </DropdownMenuItem> */}
//               <DropdownMenuSeparator />
//               {/* <DropdownMenuItem className="text-red-600" onClick={() => onDeleteClick(user)}>
//                 <Trash2 className="mr-2 h-4 w-4" />
//                 Delete User
//               </DropdownMenuItem> */}
//             </DropdownMenuContent>
//           </DropdownMenu>
//         );
//       },
//     },
//   ];
