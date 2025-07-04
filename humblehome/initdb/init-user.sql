-- Create a least-privilege user for the application
CREATE USER IF NOT EXISTS 'webapp'@'%' IDENTIFIED BY 'webapp_p@ssw0rd';

-- Grant CRUD privileges (SELECT, INSERT, UPDATE, DELETE) on the specific schema
GRANT SELECT, INSERT, UPDATE, DELETE ON humblehome.* TO 'webapp'@'%';

-- Apply changes
FLUSH PRIVILEGES;
