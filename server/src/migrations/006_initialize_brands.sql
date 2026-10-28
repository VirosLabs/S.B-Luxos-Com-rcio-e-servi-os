UPDATE site_content
SET brands = JSON_ARRAY()
WHERE brands IS NULL
