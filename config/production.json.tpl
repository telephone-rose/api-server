{{ with secret "secret/api" }}
{
  "app": {
    "googleClientId": "{{ .Data.googleClientId }}",
    "googleClientSecret": "{{ .Data.googleClientSecret }}"
  }
}
{{ end }}
