'use client';

import { useParams } from 'next/navigation';
import PatientDetailView from '@/components/patients/PatientDetailView';

export default function RecordDetailPage() {
    const { id } = useParams();

    if (!id) return <div>Invalid ID</div>;

    return <PatientDetailView id={id as string} />;
}
