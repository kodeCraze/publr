param(
  [Parameter(Mandatory = $true)]
  [string]$AuthorizationToken
)

curl.exe https://api.backblazeb2.com/b2api/v2/b2_update_bucket `
  -H "Authorization: $AuthorizationToken" `
  -H "Content-Type: application/json" `
  --data-binary "@scripts/backblaze/cors-rules.json"
