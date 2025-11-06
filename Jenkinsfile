pipeline {
    agent any

    stages {
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
