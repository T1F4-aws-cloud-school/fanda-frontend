pipeline {
    agent any
    
    environment {
        HARBOR_URL = '192.168.2.111'
        PROJECT_NAME = 'fanda-fe'
        IMAGE_NAME = "${HARBOR_URL}/${PROJECT_NAME}/frontend"
        // ✅ BUILD_NUMBER 사용 (고유한 태그)
        IMAGE_TAG = "${BUILD_NUMBER}"
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
                echo "🚀 Image Updater 방식 빌드 시작: ${IMAGE_NAME}:${IMAGE_TAG}"
                
                sh '''
                    echo "빌드 환경 정보:"
                    echo "  - Docker: $(docker --version)"
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
                                # React 앱 빌드 및 Docker 이미지 생성
                                docker build \\
                                    --tag ${IMAGE_NAME}:${IMAGE_TAG} \\
                                    --tag ${IMAGE_NAME}:latest \\
                                    --label "version=${IMAGE_TAG}" \\
                                    --label "build-date=\$(date -u +'%Y-%m-%dT%H:%M:%SZ')" \\
                                    .
                                
                                # Harbor 로그인 및 푸시
                                echo "\${HARBOR_PASS}" | docker login ${HARBOR_URL} -u "\${HARBOR_USER}" --password-stdin
                                
                                # 고유 태그 먼저 푸시 (Image Updater가 감지)
                                docker push ${IMAGE_NAME}:${IMAGE_TAG}
                                docker push ${IMAGE_NAME}:latest
                                
                                # Harbor 이미지 검증
                                if docker manifest inspect ${IMAGE_NAME}:${IMAGE_TAG} > /dev/null 2>&1; then
                                    echo "✅ Harbor 이미지 확인 성공: ${IMAGE_TAG}"
                                else
                                    echo "❌ Harbor 이미지 확인 실패: ${IMAGE_TAG}"
                                    exit 1
                                fi
                                
                                echo "✅ 이미지 빌드 & 푸시 완료"
                                echo "📦 고유 태그: ${IMAGE_NAME}:${IMAGE_TAG}"
                                echo "📦 Latest 태그: ${IMAGE_NAME}:latest"
                                echo ""
                                echo "🤖 ArgoCD Image Updater가 자동으로 처리합니다:"
                                echo "  1. Harbor에서 새 이미지 ${IMAGE_TAG} 감지"
                                echo "  2. deployment.yaml 자동 업데이트"
                                echo "  3. ArgoCD 자동 sync → 배포 완료"
                                echo ""
                                echo "⏰ 약 2-3분 내에 새 버전이 배포됩니다!"
                            """
                        } catch (Exception e) {
                            error "빌드 실패: ${e.message}"
                        }
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
🎉 Image Updater 방식 성공!

📋 진행 상황:
  ✅ 이미지 빌드: ${env.IMAGE_NAME}:${env.IMAGE_TAG} 
  ✅ Harbor 푸시: 완료
  🤖 Image Updater: 자동 처리 중
  ⏳ ArgoCD 배포: 곧 시작

🔍 진행 상황 확인:
kubectl logs -f deployment/argocd-image-updater -n argocd
            """
        }
        
        failure {
            echo "❌ 빌드 실패! 로그를 확인하세요."
        }
        
        cleanup {
            sh 'docker container prune -f || true'
        }
    }
}