pipeline {
    agent any
    
    environment {
        HARBOR_URL = '192.168.2.111'
        PROJECT_NAME = 'fanda-fe'
        IMAGE_NAME = "${HARBOR_URL}/${PROJECT_NAME}/frontend"
        IMAGE_TAG = "${BUILD_NUMBER}"  // 유니크한 태그
        DOCKER_BUILDKIT = '1'
    }
    
    options {
        buildDiscarder(logRotator(numToKeepStr: '10', daysToKeepStr: '30'))
        disableConcurrentBuilds()
        timeout(time: 20, unit: 'MINUTES')
    }
    
    stages {
        stage('환경 검증') {
            steps {
                echo "🚀 빌드 시작: ${IMAGE_NAME}:${IMAGE_TAG}"
                
                sh '''
                    echo "빌드 환경 정보:"
                    echo "  - Docker: $(docker --version)"
                    echo "  - 현재 디렉토리: $(pwd)"
                    echo "  - Git 커밋: ${GIT_COMMIT}"
                    echo "  - 이미지 태그: ${IMAGE_TAG}"
                    
                    # 필수 파일 확인
                    for file in package.json Dockerfile nginx/default.conf; do
                        if [ ! -f "$file" ]; then
                            echo "❌ 필수 파일 없음: $file"
                            exit 1
                        fi
                    done
                    echo "✅ 환경 검증 완료"
                '''
            }
        }
        
        stage('빌드 & 푸시') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'Harbor-credentials',
                    usernameVariable: 'HARBOR_USER',
                    passwordVariable: 'HARBOR_PASS'
                )]) {
                    script {
                        try {
                            sh """
                                # Docker 빌드 (유니크 태그)
                                docker build \\
                                    --tag ${IMAGE_NAME}:${IMAGE_TAG} \\
                                    --tag ${IMAGE_NAME}:latest \\
                                    --label "version=${IMAGE_TAG}" \\
                                    --label "build-date=\$(date -u +'%Y-%m-%dT%H:%M:%SZ')" \\
                                    --label "git-commit=${GIT_COMMIT}" \\
                                    .
                                
                                # Harbor 로그인 및 푸시
                                echo "\${HARBOR_PASS}" | docker login ${HARBOR_URL} -u "\${HARBOR_USER}" --password-stdin
                                docker push ${IMAGE_NAME}:${IMAGE_TAG}
                                docker push ${IMAGE_NAME}:latest
                                
                                echo "✅ 빌드 완료"
                                echo "📦 유니크 태그: ${IMAGE_NAME}:${IMAGE_TAG}"
                                echo "📦 Latest 태그: ${IMAGE_NAME}:latest"
                            """
                        } catch (Exception e) {
                            error "빌드 실패: ${e.message}"
                        }
                    }
                }
            }
        }
        
        stage('배포 파일 업데이트') {
            steps {
                script {
                    try {
                        // Git 설정
                        sh '''
                            git config --global user.email "jenkins@company.com"
                            git config --global user.name "Jenkins CI"
                        '''
                        
                        // deployment.yaml 이미지 태그 업데이트
                        sh """
                            # 현재 이미지 태그를 새로운 BUILD_NUMBER로 변경
                            sed -i 's|image: ${HARBOR_URL}/${PROJECT_NAME}/frontend:.*|image: ${HARBOR_URL}/${PROJECT_NAME}/frontend:${IMAGE_TAG}|g' k8s/deployment.yaml
                            
                            # 변경사항 확인
                            echo "=== 업데이트된 deployment.yaml ==="
                            grep "image:" k8s/deployment.yaml
                        """
                        
                        // Git 커밋 및 푸시
                        withCredentials([string(credentialsId: 'github-token', variable: 'GITHUB_TOKEN')]) {
                            sh """
                                # Git 변경사항 커밋
                                git add k8s/deployment.yaml
                                git commit -m "🚀 Update image tag to ${IMAGE_TAG} [skip ci]" || echo "No changes to commit"
                                
                                # GitHub에 푸시
                                git push https://${GITHUB_TOKEN}@github.com/T1F4-aws-cloud-school/fanda-frontend.git HEAD:main || echo "Push failed, but continuing..."
                            """
                        }
                        
                        echo "✅ 배포 파일 업데이트 완료"
                        echo "🔄 ArgoCD가 새로운 태그를 감지하여 자동 배포합니다"
                        
                    } catch (Exception e) {
                        echo "⚠️ 배포 파일 업데이트 실패: ${e.message}"
                        echo "수동으로 확인이 필요할 수 있습니다."
                    }
                }
            }
        }
    }
    
    post {
        always {
            sh '''
                docker logout ${HARBOR_URL} 2>/dev/null || true
                docker rmi ${IMAGE_NAME}:${IMAGE_TAG} ${IMAGE_NAME}:latest 2>/dev/null || true
                docker system prune -f --volumes
            '''
            echo '🏁 파이프라인 완료'
        }
        
        success {
            echo """
🎉 빌드 & 배포 성공!

📋 결과:
  ├─ 유니크 태그: ${env.IMAGE_NAME}:${env.IMAGE_TAG}
  ├─ Latest 태그: ${env.IMAGE_NAME}:latest
  ├─ Git 업데이트: k8s/deployment.yaml
  └─ ArgoCD: 자동 배포 진행 중

            """
        }
        
        failure {
            echo """
❌ 빌드 실패!
🛠️ 이미지는 성공적으로 빌드되었다면 수동 배포 가능:
   kubectl set image deployment/fanda-fe-deploy fanda-fe=${env.IMAGE_NAME}:${env.IMAGE_TAG} -n fanda-fe
            """
        }
        
        cleanup {
            sh 'docker container prune -f || true'
        }
    }
}