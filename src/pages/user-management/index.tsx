import { ModeToggle } from "@/components/theme/theme-toggle";
import UserManagementTable from "@/features/user-management/table";

const UsersPage = () => {

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-end mb-4">
        <ModeToggle />
      </div>
      <h1 className="text-2xl font-bold mb-4">User Management</h1>
      <UserManagementTable />
    </div>
  );
};

export default UsersPage;
