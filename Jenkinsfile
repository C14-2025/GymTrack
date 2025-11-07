pipeline {
    agent any

    stages {
        stage('Install Docker CLI') {
            steps {
                // Instala o cliente Docker CLI dentro do container Jenkins
                sh 'sudo apt-get update && sudo apt-get install -y docker.io'
            }
        }

        stage('Build Docker Image'){
            steps{
                script{
                    dockerapp = docker.build("C14-2025/GymTrack:${env.BUILD_ID}", '.')
                }
            }
        }

        stage('Push Docker Image'){
            steps{
                script{
                    docker.withRegistry('https://registry.hub.docker.com', 'dockerhub'){
                        dockerapp.push('latest')
                        dockerapp.push("${env.BUILD_ID}")
                    }
                }
            }
        }
    }
}
