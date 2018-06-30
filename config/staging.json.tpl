{{ with secret "secret/api/staging" }}
{
  "app": {
    "googleClientId": "{{ .Data.googleClientId }}",
    "googleClientSecret": "{{ .Data.googleClientSecret }}",
    "facebookAppId": "{{ .Data.facebookAppId }}",
    "facebookAppSecret": "{{ .Data.facebookAppSecret }}"
  }
}
{{ end }}
