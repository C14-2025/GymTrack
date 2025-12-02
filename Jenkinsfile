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
        
        stage('Testes de Unidade') {
            steps {
                sh '''
                echo "🧪 Rodando testes..."
                npx jest --coverage 
                '''
            }
            post {
                always {
                    echo "📁 Salvando relatórios de teste e cobertura..."
                    junit 'test-reports/junit.xml' 
                    archiveArtifacts artifacts: 'coverage/**' 
                    archiveArtifacts artifacts: 'test-reports/test-report.html'
                }
            }
        }
    }
}
