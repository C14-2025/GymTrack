pipeline {
    agent any
    
    tools {
        nodejs 'Node-20' 
    }
    
    stages {
        
        stage('Instalar Dependências') {
            steps {
                sh 'npm install'
            }
        }
        
        stage('Testes de Unidade') {
            steps {
                sh 'npm test'
            }
        }
        
        stage('Teste de Conexão e Integração') {
            steps {
                sh "curl -f http://gymtrack:3000"
            }
        }
    }
}
