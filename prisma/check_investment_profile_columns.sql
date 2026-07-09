SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'investment_profiles'
ORDER BY ordinal_position;
