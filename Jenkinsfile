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
    }
}
