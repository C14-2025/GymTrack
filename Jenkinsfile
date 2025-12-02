pipeline {
    agent any

    tools {
        nodejs 'Node-20'
    }

    stages {

        stage('Instalar Dependências') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Build e Test') {
            parallel {

                stage('Build') {
                    steps {
                        sh 'npm run build'
                    }
                    post {
                        always {
                            
                            archiveArtifacts artifacts: '.next/**', fingerprint: true
                        }
                    }
                }

                stage('Testes de Unidade') {
                    steps {
                        sh 'npx jest --coverage'
                    }
                    post {
                        always {
                            junit 'test-reports/junit.xml'
                            archiveArtifacts artifacts: 'coverage/**'
                        }
                    }
                }

            }
        }

    }

    post {
        success {
            emailext(
                to: 'henrique.pereira@ges.inatel.br',
                subject: "✔️ Sucesso no pipeline ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: "O pipeline rodou com sucesso."
            )
        }

        failure {
            emailext(
                to: 'henrique.pereira@ges.inatel.br',
                subject: "❌ Falha no pipeline ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: "O build falhou. Veja os logs no Jenkins."
            )
        }
    }
}
