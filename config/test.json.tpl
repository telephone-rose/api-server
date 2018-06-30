{{ with secret "secret/api/test" }}
{
  "app": {
    "googleClientId": "{{ .Data.googleClientId }}",
    "googleClientSecret": "{{ .Data.googleClientSecret }}",
    "facebookAppId": "{{ .Data.facebookAppId }}",
    "facebookAppSecret": "{{ .Data.facebookAppSecret }}",
    "jwtAccessTokenAlgorithm": "HS256",
    "jwtRefreshTokenAlgorithm": "HS256",
    "jwtAccessTokenKey": "access",
    "jwtRefreshTokenKey": "refresh"
  }
}
{{ end }}
