pipeline{
    agent any

    stages {
        satage('Bild Docker Image'){
            staps{
                script{
                    dockerapp = docker.build("C14-2025/GymTrack:${env.BUILD_ID},'-f .GymTrack/Dockerfile'")
                }
            }
        }
        satage('Push Doker Image'){
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