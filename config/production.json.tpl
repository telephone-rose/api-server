{{ with secret "secret/api/production" }}
{
  "app": {
    "googleClientId": "{{ .Data.googleClientId }}",
    "googleClientSecret": "{{ .Data.googleClientSecret }}",
    "facebookAppId": "{{ .Data.facebookAppId }}",
    "facebookAppSecret": "{{ .Data.facebookAppSecret }}"
  }
}
{{ end }}
