pipeline {
    agent any

    stages {
        stage('Build Docker Image'){
            steps{
                script{
                    dockerapp = docker.build("c14-2025/gymtrack:${env.BUILD_ID}", '.')
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
