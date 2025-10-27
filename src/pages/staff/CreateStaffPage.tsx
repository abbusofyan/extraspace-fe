import { AdminLayout } from "@/components/layout/AdminLayout";
import { StaffForm } from "@/components/forms/StaffForm";

export function CreateStaffPage() {
    return (
        <AdminLayout>
            <StaffForm mode="create" />
        </AdminLayout>
    );
}
