IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'HrManagementDb')
BEGIN
    CREATE DATABASE HrManagementDb;
END