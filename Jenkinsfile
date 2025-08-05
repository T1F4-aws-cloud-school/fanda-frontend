pipeline {
    agent any
    
    environment {
        // Harbor Registry 설정
        HARBOR_URL = '192.168.2.111'
        HARBOR_CREDENTIALS = 'harbor-credentials'
        
        // 프로젝트 설정
        PROJECT_NAME = 'fanda-frontend'
        IMAGE_NAME = "${HARBOR_URL}/${PROJECT_NAME}"
        IMAGE_TAG = "${BUILD_NUMBER}"
        
        // Docker 설정
        DOCKER_BUILDKIT = '1'  // 빌드 성능 향상
    }
    
    options {
        // 빌드 기록 관리
        buildDiscarder(logRotator(
            numToKeepStr: '10',
            daysToKeepStr: '30'
        ))
        
        // 동시 빌드 방지
        disableConcurrentBuilds()
        
        // 타임아웃 설정 (15분)
        timeout(time: 15, unit: 'MINUTES')
    }
    
    stages {
        stage('준비') {
            steps {
                echo '🚀 fanda-frontend 빌드 시작'
                
                // 환경 검증
                sh '''
                    echo "빌드 정보:"
                    echo "  - 프로젝트: ${PROJECT_NAME}"
                    echo "  - 빌드 번호: ${BUILD_NUMBER}"
                    echo "  - 이미지: ${IMAGE_NAME}:${IMAGE_TAG}"
                    
                    echo "시스템 확인:"
                    docker --version
                    node --version 2>/dev/null || echo "  - Node.js: Docker에서 사용"
                    
                    echo "필수 파일 확인:"
                    test -f package.json && echo "  ✅ package.json" || (echo "  ❌ package.json 없음" && exit 1)
                    test -f Dockerfile && echo "  ✅ Dockerfile" || (echo "  ❌ Dockerfile 없음" && exit 1)
                '''
            }
        }
        
        stage('빌드') {
            steps {
                echo '📦 Docker 이미지 빌드 중...'
                
                script {
                    try {
                        sh """
                            # 이전 빌드 캐시 활용을 위한 정리
                            docker system prune -f --volumes=false
                            
                            # Docker 이미지 빌드
                            docker build \\
                                --tag ${IMAGE_NAME}:${IMAGE_TAG} \\
                                --tag ${IMAGE_NAME}:latest \\
                                --label "build.number=${BUILD_NUMBER}" \\
                                --label "build.url=${BUILD_URL}" \\
                                --label "git.commit=${env.GIT_COMMIT ?: 'unknown'}" \\
                                .
                            
                            # 빌드 결과 확인
                            docker images ${IMAGE_NAME}:${IMAGE_TAG}
                        """
                        
                        echo '✅ Docker 빌드 완료'
                        
                    } catch (Exception e) {
                        echo '❌ Docker 빌드 실패'
                        sh 'docker system df'  // 디스크 사용량 확인
                        throw e
                    }
                }
            }
        }
        
        stage('푸시') {
            steps {
                echo '🚢 Harbor에 이미지 업로드 중...'
                
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
                        
                        echo "✅ 이미지 업로드 완료: ${IMAGE_NAME}:${IMAGE_TAG}"
                    """
                }
            }
        }
    }
    
    post {
        always {
            // 정리 작업
            sh '''
                # Harbor 로그아웃
                docker logout ${HARBOR_URL} 2>/dev/null || true
                
                # 로컬 이미지 정리 (디스크 공간 절약)
                docker rmi ${IMAGE_NAME}:${IMAGE_TAG} 2>/dev/null || true
                docker rmi ${IMAGE_NAME}:latest 2>/dev/null || true
            '''
            
            echo '''
            ==========================================
            🏁 fanda-frontend 파이프라인 완료
            ==========================================
            '''
        }
        
        success {
            echo '''
            ✅ 성공! 다음 단계:
            1. Harbor에서 이미지 확인
            2. 팀원과 k8s 배포 논의
            '''
        }
        
        failure {
            echo '''
            ❌ 실패! 확인사항:
            1. Console Output 로그
            2. Harbor 접속 상태
            3. Docker 서비스 상태
            '''
        }
        
        cleanup {
            // 최종 정리
            sh 'docker container prune -f || true'
        }
    }
}