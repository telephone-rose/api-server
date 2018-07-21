{{ with secret "secret/api/production" }}
{
  "app": {
    "awsS3AccessKeyId": "{{ .Data.awsS3AccessKeyId }}",
    "awsS3SecretAccessKey": "{{ .Data.awsS3SecretAccessKey }}",
    "awsS3Region": "{{ .Data.awsS3Region }}",
    "awsS3UploadBucket": "{{ .Data.awsS3UploadBucket }}",
    "googleClientId": "{{ .Data.googleClientId }}",
    "googleClientAudiences": "{{ .Data.googleClientAudiences }}",
    "googleClientSecret": "{{ .Data.googleClientSecret }}",
    "facebookAppId": "{{ .Data.facebookAppId }}",
    "facebookAppSecret": "{{ .Data.facebookAppSecret }}",
    "googleCloudPlatformAPIKey": "{{ .Data.googleCloudPlatformAPIKey }}"
  }
}
{{ end }}

