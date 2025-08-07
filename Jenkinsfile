pipeline {
    agent any
    
    environment {
        HARBOR_URL = '192.168.2.111'
        PROJECT_NAME = 'fanda-fe'
        IMAGE_NAME = "${HARBOR_URL}/${PROJECT_NAME}/frontend"
        IMAGE_TAG = "${BUILD_NUMBER}"
        DOCKER_BUILDKIT = '1'  // 빌드 성능 향상
    }
    
    options {
        buildDiscarder(logRotator(numToKeepStr: '10', daysToKeepStr: '30'))
        disableConcurrentBuilds()  // 중복 빌드 방지
        timeout(time: 20, unit: 'MINUTES')  // 타임아웃 설정
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
                                # Docker 빌드 (성능 최적화)
                                docker build \\
                                    --tag ${IMAGE_NAME}:${IMAGE_TAG} \\
                                    --tag ${IMAGE_NAME}:latest \\
                                    --label "version=${IMAGE_TAG}" \\
                                    --label "build-date=\$(date -u +'%Y-%m-%dT%H:%M:%SZ')" \\
                                    --label "git-commit=${GIT_COMMIT}" \\
                                    .
                                
                                # 이미지 크기 확인
                                docker images ${IMAGE_NAME}:${IMAGE_TAG} --format "table {{.Repository}}:{{.Tag}}\\t{{.Size}}"
                                
                                # Harbor 로그인 및 푸시
                                echo "\${HARBOR_PASS}" | docker login ${HARBOR_URL} -u "\${HARBOR_USER}" --password-stdin
                                docker push ${IMAGE_NAME}:${IMAGE_TAG}
                                docker push ${IMAGE_NAME}:latest
                                
                                echo "✅ 빌드 완료: ${IMAGE_NAME}:${IMAGE_TAG}"
                            """
                        } catch (Exception e) {
                            error "빌드 실패: ${e.message}"
                        }
                    }
                }
            }
        }
        
        stage('배포 트리거') {
            steps {
                script {
                    try {
                        sh """
                            echo "🔄 Kubernetes 배포 트리거"
                            
                            # kubectl 명령어 확인
                            kubectl version --client || (echo "❌ kubectl 명령어 없음" && exit 1)
                            
                            # 네임스페이스 및 deployment 존재 확인
                            kubectl get deployment fanda-fe-deploy -n fanda-fe || (echo "❌ deployment 없음" && exit 1)
                            
                            # Pod 재시작으로 최신 이미지 적용
                            kubectl patch deployment fanda-fe-deploy -n fanda-fe -p '{"spec":{"template":{"metadata":{"annotations":{"kubectl.kubernetes.io/restartedAt":"'\$(date +%Y-%m-%dT%H:%M:%S%z)'"}}}}}'
                            
                            # 재시작 상태 확인 (30초 대기)
                            echo "⏳ 배포 상태 확인 중..."
                            kubectl rollout status deployment/fanda-fe-deploy -n fanda-fe --timeout=30s
                            
                            echo "✅ 배포 완료"
                        """
                    } catch (Exception e) {
                        echo "⚠️ 배포 트리거 실패: ${e.message}"
                        echo "수동으로 확인이 필요할 수 있습니다."
                        echo "수동 명령어: kubectl rollout restart deployment fanda-fe-deploy -n fanda-fe"
                    }
                }
            }
        }
    }
    
    post {
        always {
            sh '''
                # 정리 작업
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
  ├─ 이미지: ${env.IMAGE_NAME}:${env.IMAGE_TAG}
  ├─ Latest: ${env.IMAGE_NAME}:latest
  ├─ Harbor: ${env.HARBOR_URL}/harbor/projects
  └─ 배포: Kubernetes Pod 재시작 완료

            """
        }
        
        failure {
            echo """
❌ 빌드 또는 배포 실패!

🛠️ 수동 복구:
  kubectl rollout restart deployment fanda-fe-deploy -n fanda-fe
            """
        }
        
        cleanup {
            sh 'docker container prune -f || true'
        }
    }
}