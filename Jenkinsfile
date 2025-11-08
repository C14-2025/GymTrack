pipeline {
    agent any

    stages {
        
        stage('Teste de conexão'){
            steps{
                    sh "curl http://gymtrack:3000"
            }
        }
        
        stage('Instalando dependencias'){
            steps{
                    sh 'npm Install'
            }
        }
        
        stage('Rodando os tests'){
            steps{
                    sh 'npm test'
            }
        }
    }
}
