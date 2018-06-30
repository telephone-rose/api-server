export VAULT_ADDR=https://vault.telephone-ro.se
export SECRET_ID=$(vault write -field=secret_id -f auth/approle/role/jenkins/secret-id)
export VAULT_TOKEN=$(vault write -field=token auth/approle/login role_id=8fb710ed-7849-230c-e051-133138593730 secret_id=$SECRET_ID)
consul-template -once -vault-token=$VAULT_TOKEN -vault-renew-token=false \
  -template="jwt-access-token-key.pub.tpl:jwt-access-token-key.pub" \
  -template="jwt-access-token-key.tpl:jwt-access-token-key" \
  -template="jwt-refresh-token-key.pub.tpl:jwt-refresh-token-key.pub" \
  -template="jwt-refresh-token-key.tpl:jwt-refresh-token-key" \
  -template="config/production.json.tpl:config/production.json" \
  -template="config/staging.json.tpl:config/staging.json" \
  -template="config/test.json.tpl:config/test.json" 
