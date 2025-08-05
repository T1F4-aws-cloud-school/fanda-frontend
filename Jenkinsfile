pipeline {
    agent any
    
    environment {
        // Harbor Registry 설정
        HARBOR_URL = '192.168.2.111'
        HARBOR_CREDENTIALS = 'Harbor-credentials'
        
        // 프로젝트 설정
        PROJECT_NAME = 'fanda-fe'
        IMAGE_NAME = "${HARBOR_URL}/${PROJECT_NAME}"
        IMAGE_TAG = "${BUILD_NUMBER}"
        
        // Docker 설정
        DOCKER_BUILDKIT = '1'
    }
    
    options {
        buildDiscarder(logRotator(numToKeepStr: '10', daysToKeepStr: '30'))
        disableConcurrentBuilds()
        timeout(time: 15, unit: 'MINUTES')
    }
    
    stages {
        stage('환경 검증') {
            steps {
                echo '🚀 fanda-frontend 빌드 시작'
                
                sh """
                    echo "빌드 정보:"
                    echo "  - 프로젝트: ${PROJECT_NAME}"
                    echo "  - 빌드 번호: ${BUILD_NUMBER}"
                    echo "  - 이미지: ${IMAGE_NAME}:${IMAGE_TAG}"
                    
                    echo "필수 파일 확인:"
                    if [ ! -f package.json ]; then
                        echo "❌ package.json 없음" && exit 1
                    fi
                    if [ ! -f Dockerfile ]; then
                        echo "❌ Dockerfile 없음" && exit 1
                    fi
                    if [ ! -f nginx/default.conf ]; then
                        echo "❌ nginx/default.conf 없음" && exit 1
                    fi
                    echo "✅ 필수 파일 확인 완료"
                """
            }
        }
        
        stage('빌드') {
            steps {
                echo '📦 Docker 이미지 빌드 중...'
                
                script {
                    try {
                        sh """
                            # Docker 이미지 빌드
                            docker build \\
                                --tag ${IMAGE_NAME}:${IMAGE_TAG} \\
                                --tag ${IMAGE_NAME}:latest \\
                                --label "version=${IMAGE_TAG}" \\
                                --label "build-date=\$(date -u +'%Y-%m-%dT%H:%M:%SZ')" \\
                                --label "git-commit=${GIT_COMMIT}" \\
                                .
                            
                            # 이미지 크기 확인
                            docker images ${IMAGE_NAME}:${IMAGE_TAG} --format "table {{.Repository}}:{{.Tag}}\\t{{.Size}}"
                        """
                        
                        echo '✅ Docker 빌드 완료'
                        
                    } catch (Exception e) {
                        error "Docker 빌드 실패: ${e.message}"
                    }
                }
            }
        }
        
        stage('Harbor 푸시') {
            steps {
                echo '🚢 Harbor Registry에 이미지 업로드 중...'
                
                withCredentials([usernamePassword(
                    credentialsId: env.HARBOR_CREDENTIALS,
                    usernameVariable: 'HARBOR_USER',
                    passwordVariable: 'HARBOR_PASS'
                )]) {
                    sh """
                        # Harbor 로그인
                        echo "\${HARBOR_PASS}" | docker login ${HARBOR_URL} -u "\${HARBOR_USER}" --password-stdin
                        
                        # 이미지 푸시
                        docker push ${IMAGE_NAME}:${IMAGE_TAG}
                        docker push ${IMAGE_NAME}:latest
                        
                        echo "✅ Harbor 업로드 완료"
                        echo "   이미지 URL: ${HARBOR_URL}/harbor/projects"
                    """
                }
            }
        }
    }
    
    post {
        always {
            sh '''
                # Harbor 로그아웃
                docker logout ${HARBOR_URL} 2>/dev/null || true
                
                # 로컬 이미지 정리
                docker rmi ${IMAGE_NAME}:${IMAGE_TAG} ${IMAGE_NAME}:latest 2>/dev/null || true
                docker system prune -f
            '''
            
            echo '🏁 fanda-frontend 파이프라인 완료'
        }
        
        success {
            echo """
🎉 빌드 성공!

결과 요약:
  프로젝트: ${env.PROJECT_NAME}
  이미지: ${env.IMAGE_NAME}:${env.IMAGE_TAG}
  Harbor: ${env.HARBOR_URL}/harbor/projects

다음 단계: ArgoCD에서 자동 배포가 시작됩니다
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
