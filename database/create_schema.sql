-- Create survey_test schema if not exists
CREATE SCHEMA IF NOT EXISTS survey_test;

-- Set search_path to use survey_test as default
-- ALTER DATABASE qumpara_test4 SET search_path TO survey_test, public;

-- Grant permissions
GRANT ALL ON SCHEMA survey_test TO qumpara;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA survey_test TO qumpara;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA survey_test TO qumpara;

-- Check if schema was created
SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'survey_test';

-- List all tables in survey_test schema
SELECT tablename FROM pg_tables WHERE schemaname = 'survey_test';
