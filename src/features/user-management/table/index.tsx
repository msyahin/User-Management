import { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/table/data-table"
import { useDebounce } from "@/features/hooks/use-debounce"
import { fetchUsers } from "../api"
import { createUserManagementColumns } from "./columns"

const UserManagementTable = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);

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

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-4">
        <Input
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Button>Add User</Button>
      </div>
      <DataTable columns={columns} data={users ?? []} />
    </div>
  );
};

export default UserManagementTable;
