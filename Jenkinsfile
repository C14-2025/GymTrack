pipeline{
    agent any

    stages {
        stage('Bild Docker Image'){
            staps{
                script{
                    dockerapp = docker.build("C14-2025/GymTrack:${env.BUILD_ID}",'.')
                }
            }
        }
        stage('Push Doker Image'){
            staps{
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
