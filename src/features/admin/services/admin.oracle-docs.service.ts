import api from "@/shared/api/instance.api";

export interface OracleColumnDoc {
  name: string;
  dataType: string;
  nullable: boolean;
  comment: string | null;
}

export interface OracleTableDoc {
  name: string;
  comment: string | null;
  columns: OracleColumnDoc[];
  foreignKeys: {
    constraintName: string;
    columns: string;
    parentTable: string;
    parentColumns: string;
  }[];
  referencedBy: string[];
}

export interface OraclePlsqlDoc {
  name: string;
  type: string;
  status: string;
  lastDdlTime: string;
  arguments: {
    name: string | null;
    position: number;
    dataType: string | null;
    inOut: string;
    packageName: string | null;
  }[];
}

export interface OracleSchemaDocs {
  version: number;
  generatedAt: string;
  fingerprint: string;
  counts: Record<string, number>;
  tables: OracleTableDoc[];
  plsql: OraclePlsqlDoc[];
  views: { name: string }[];
  indexes: { name: string; table: string; unique: boolean }[];
  history: { at: string; trigger: string; changes: string[] }[];
}

export interface OracleDocsStatus {
  generatedAt: string;
  fingerprint: string;
  counts: Record<string, number>;
  lastCheckAt: string;
  lastTrigger: string;
}

export const adminOracleDocsService = {
  getDocs: async (): Promise<OracleSchemaDocs> => {
    const res = await api.get("/oracle/docs");
    return res.data;
  },
  getStatus: async (): Promise<OracleDocsStatus | null> => {
    const res = await api.get("/oracle/docs/status");
    return res.data || null;
  },
  refresh: async (): Promise<OracleDocsStatus | null> => {
    const res = await api.post("/oracle/docs/refresh");
    return res.data || null;
  },
};
