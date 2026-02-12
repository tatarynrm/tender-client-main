"use client";
import { useEffect, useState } from "react";

import api from "@/shared/api/instance.api";
import { useParams } from "next/navigation";

import LoadForm from "@/features/log/load/LoadForm";
import Loading from "@/shared/components/ui/Loading";
import TenderSaveForm from "@/features/log/tender/components/TenderSaveForm";

export default function EditCargoPage() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get(`/tender/${id}`);
        console.log(data, "DATA");

        setData(data.content);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <Loading />;
  if (!data) return <div>Заявку не знайдено</div>;

  return <TenderSaveForm defaultValues={data} isEdit={true} />;
}
