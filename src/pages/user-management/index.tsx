import UserManagementTable from "@/features/user-management/table";

const UsersPage = () => {

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">User Management</h1>
      <UserManagementTable />
    </div>
  );
};

export default UsersPage;
