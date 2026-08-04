import { OracleDocumentation } from "@/features/admin/documentation/OracleDocumentation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Документація БД Oracle",
};

const DocumentationPage = () => {
  return <OracleDocumentation />;
};

export default DocumentationPage;
