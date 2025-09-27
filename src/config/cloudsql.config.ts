const CLOUD_SQL_DEFAULTS = {
  instanceConnectionName: "where-is-the-library:us-central1:biblioteca-sql",
  connectivity: {
    private: {
      enabled: true,
      privateServiceAccessEnabled: true,
      associatedNetworks: ["projects/where-is-the-library/global/networks/default"],
      vpcNetwork: "default",
      assignedIpRange: "automatic",
      ipAddress: "10.113.96.4",
    },
    public: {
      enabled: true,
      ipAddress: "34.46.246.183",
    },
  },
  database: {
    url: "postgresql://library_user:_a1Dk4WYkKl_YRBlPrwemtTfL8yGaZXfWNIxb50-nag@/library_db?host=/cloudsql/where-is-the-library:us-central1:biblioteca-sql",
    port: 5432,
  },
} as const

Object.freeze(CLOUD_SQL_DEFAULTS)
Object.freeze(CLOUD_SQL_DEFAULTS.connectivity)
Object.freeze(CLOUD_SQL_DEFAULTS.connectivity.private)
Object.freeze(CLOUD_SQL_DEFAULTS.connectivity.private.associatedNetworks)
Object.freeze(CLOUD_SQL_DEFAULTS.connectivity.public)
Object.freeze(CLOUD_SQL_DEFAULTS.database)

type CloudSqlDefaults = typeof CLOUD_SQL_DEFAULTS

export type CloudSqlConfig = CloudSqlDefaults

export const cloudSqlDefaults: CloudSqlConfig = CLOUD_SQL_DEFAULTS

export function loadCloudSqlConfig(): { cloudSql: CloudSqlConfig } {
  return { cloudSql: CLOUD_SQL_DEFAULTS }
}

export function ensureCloudSqlEnv(env: NodeJS.ProcessEnv = process.env): CloudSqlConfig {
  const config = cloudSqlDefaults

  if (!env.INSTANCE_CONNECTION_NAME) {
    env.INSTANCE_CONNECTION_NAME = config.instanceConnectionName
  }

  if (!env.DATABASE_URL) {
    env.DATABASE_URL = config.database.url
  }

  return config
}
