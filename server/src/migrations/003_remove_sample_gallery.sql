UPDATE site_content
SET gallery = JSON_ARRAY()
WHERE id = 1
  AND JSON_LENGTH(gallery) = 3
  AND JSON_UNQUOTE(JSON_EXTRACT(gallery, '$[0].id')) = 'inspiracao-1'
  AND JSON_UNQUOTE(JSON_EXTRACT(gallery, '$[1].id')) = 'inspiracao-2'
  AND JSON_UNQUOTE(JSON_EXTRACT(gallery, '$[2].id')) = 'inspiracao-3'
