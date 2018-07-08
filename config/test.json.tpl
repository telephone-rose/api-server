{{ with secret "secret/api/test" }}
{
  "app": {
    "awsS3AccessKeyId": "{{ .Data.awsS3AccessKeyId }}",
    "awsS3SecretAccessKey": "{{ .Data.awsS3SecretAccessKey }}",
    "awsS3Region": "{{ .Data.awsS3Region }}",
    "awsS3UploadBucket": "{{ .Data.awsS3UploadBucket }}",
    "googleClientId": "{{ .Data.googleClientId }}",
    "googleClientSecret": "{{ .Data.googleClientSecret }}",
    "facebookAppId": "{{ .Data.facebookAppId }}",
    "facebookAppSecret": "{{ .Data.facebookAppSecret }}",
    "jwtAccessTokenAlgorithm": "HS256",
    "jwtRefreshTokenAlgorithm": "HS256",
    "jwtAccessTokenKey": "access",
    "jwtRefreshTokenKey": "refresh",
    "googleCloudPlatformAPIKey": "{{ .Data.googleCloudPlatformAPIKey }}"
  }
}
{{ end }}
