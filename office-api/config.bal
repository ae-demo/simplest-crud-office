import ballerina/os;

// office-db (postgres-cnpg) — envBindings from specs/design/components/office-api/design.json
configurable string officeDbHost = os:getEnv("OFFICE_DB_HOST");
configurable string officeDbPort = os:getEnv("OFFICE_DB_PORT");
configurable string officeDbName = os:getEnv("OFFICE_DB_DBNAME");
configurable string officeDbUser = os:getEnv("OFFICE_DB_USER");
configurable string officeDbPassword = os:getEnv("OFFICE_DB_PASSWORD");
