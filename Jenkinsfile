pipeline {
  agent {
    dockerfile {
      filename 'Dockerfile.build'
    }
  }

  environment {
    AWS_ACCESS_KEY_ID         = credentials("jenkins-aws-secret-key-id")
    AWS_SECRET_ACCESS_KEY     = credentials("jenkins-aws-secret-access-key")
    AWS_REGION                = "eu-west-1"
  }

  stages {
    stage("Build") {
      steps {
        sh "npm ci"
        sh "npm run build"
      }
    }

    stage("Test") {
      steps {
        sh "npm run lint"
        sh "npm test"
      }
    }

    stage("Deploy production") { 
      when { branch "master" }
      steps {
        sh "npm run deploy"
      }
    }
  }
}