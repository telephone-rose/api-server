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

    stage("Build") {
      agent {
        dockerfile {
          filename 'Dockerfile.build'
        }
      }
      steps {
        sh "npm ci"
        sh "npm run build"
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
                sh "npm ci"
                sh "npm run lint"
                sh "npm test"
              }
            }
          }
        }
      }
    }

    stage("Generate secret templated files") {
      when { branch "master" }

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
          export SECRET_ID=$(vault write -field=secret_id -f auth/approle/role/jenkins/secret-id)
          export VAULT_TOKEN=$(vault write -field=token auth/approle/login role_id=8fb710ed-7849-230c-e051-133138593730 secret_id=$SECRET_ID)
          consul-template -once -vault-token=$VAULT_TOKEN -vault-renew-token=false -template="jwt-access-token-key.pub.tpl:jwt-access-token-key.pub" -template="jwt-access-token-key.tpl:jwt-access-token-key" -template="jwt-refresh-token-key.pub.tpl:jwt-refresh-token-key.pub" -template="jwt-refresh-token-key.tpl:jwt-refresh-token-key" -template="config/production.json.tpl:config/production.json"
        '''
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