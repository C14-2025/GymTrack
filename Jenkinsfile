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
                sh '''
                echo "🧪 Rodando testes..."
                npm ci
                npx jest --coverage 
                '''
            }
            post {
                always {
                    echo "📁 Salvando relatórios..."
                    junit 'test-reports/junit.xml'             
                    archiveArtifacts 'coverage/**' 
                    archiveArtifacts artifacts: 'test-reports/junit.xml'
                }
            }
        }
    }
}
