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
🎉 빌드 성공!

📋 결과:
  ├─ 이미지: ${env.IMAGE_NAME}:${env.IMAGE_TAG}
  ├─ Harbor: ${env.HARBOR_URL}/harbor/projects
  └─ 상태: ArgoCD Image Updater가 자동 배포 진행 중

🚀 ArgoCD에서 배포 상태를 확인하세요!
            """
        }
        
        failure {
            echo """
❌ 빌드 실패!

🔍 확인사항:
  - Docker 데몬 상태
  - Harbor 접속 및 인증
  - 네트워크 연결 상태
  - 디스크 공간
            """
        }
        
        cleanup {
            sh 'docker container prune -f || true'
        }
    }
}