import { AdminLayout } from "@/components/layout/AdminLayout";
import { StaffForm } from "@/components/forms/StaffForm";
import { useParams } from "react-router-dom";

export function EditStaffPage() {
    const { id } = useParams();

    return (
        <AdminLayout>
            <StaffForm mode="edit" staffId={id} />
        </AdminLayout>
    );
}
