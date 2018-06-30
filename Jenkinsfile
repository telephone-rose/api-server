pipeline {
  agent any

  tools {
    'org.jenkinsci.plugins.docker.commons.tools.DockerTool' 'docker'
  }

  environment {
    AWS_ACCESS_KEY_ID         = credentials("jenkins-aws-secret-key-id")
    AWS_SECRET_ACCESS_KEY     = credentials("jenkins-aws-secret-access-key")
    AWS_REGION                = "eu-west-1"
    AWS_DEFAULT_REGION        = "eu-west-1"
  }

  stages {

    stage("Generate secret templated files") {

      agent {
        dockerfile {
          filename 'Dockerfile.vault'
        }
      }

      environment {
        VAULT_TOKEN = credentials("VAULT_TOKEN")
      }

      steps {
        sh '''
          set +x
          ./generate-templates.sh
        '''
        sh "ls config"
      }
    }

    stage("Build") {
      agent {
        dockerfile {
          filename 'Dockerfile.build'
        }
      }
      steps {
        sh "npm ci"
        sh "npm run build"
        sh "ls"
        sh "ls config"
      }
    }

    stage("Test") {
      environment {
        REDIS_HOST  = "redis"
        DB_NAME     = "postgres"
        DB_HOST     = "postgres"
        DB_PASSWORD = "password"
        DB_USERNAME = "postgres"
        NODE_ENV    = "test"
      }
      steps {
        script {
          docker.image("postgres").withRun("-e POSTGRES_PASSWORD=${env.DB_PASSWORD} -e POSTGRES_USER=${env.DB_USERNAME} -e POSTGRES_DB=${env.DB_NAME}") { pgContainer ->
            docker.image("redis").withRun("") { redisContainer ->
              docker.image('node').inside("--link ${pgContainer.id}:pg --link ${redisContainer.id}:redis") {
                sh "ls"
                sh "ls config"
                sh "npm ci"
                sh "npm run lint"
                sh "npm test"
              }
            }
          }
        }
      }
    }

    stage("Deploy production") { 
      when { branch "master" }

      agent {
        dockerfile {
          filename 'Dockerfile.build'
        }
      }

      steps {
        sh "npm run deploy"
      }
    }
  }
}