pipeline {
    agent any
    
    environment {
        // Harbor Registry 설정
        HARBOR_URL = '192.168.2.111'
        HARBOR_CREDENTIALS = 'Harbor-credentials'
        
        // 프로젝트 설정
        PROJECT_NAME = 'fanda-fe'
        IMAGE_NAME = "${HARBOR_URL}/${PROJECT_NAME}/frontend"
        IMAGE_TAG = "${BUILD_NUMBER}"
        GIT_CREDENTIALS = 'github-credentials'
        
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
                    if [ ! -f k8s/deployment.yaml ]; then
                        echo "❌ k8s/deployment.yaml 없음" && exit 1
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
        
        stage('GitOps 매니페스트 업데이트') {  
            steps {
                echo '📝 K8s 매니페스트 업데이트 중...'
                
                withCredentials([usernamePassword(
                    credentialsId: env.GIT_CREDENTIALS,
                    usernameVariable: 'GIT_USER',
                    passwordVariable: 'GIT_PASS'
                )]) {
                    sh """
                        # Git 설정
                        git config user.name "Jenkins CI"
                        git config user.email "jenkins@fanda-fe.com"
                        
                        # k8s/deployment.yaml에서 이미지 태그 업데이트
                        echo "이미지 태그 업데이트: latest → ${IMAGE_TAG}"
                        
                        # sed로 이미지 태그 변경
                        sed -i 's|image: 192.168.2.111/fanda-fe/frontend:.*|image: 192.168.2.111/fanda-fe/frontend:${IMAGE_TAG}|g' k8s/deployment.yaml
                        
                        # 변경사항 확인
                        echo "변경된 deployment.yaml:"
                        grep "image:" k8s/deployment.yaml
                        
                        # Git에 커밋 및 푸시
                        git add k8s/deployment.yaml
                        
                        if git diff --staged --quiet; then
                            echo "변경사항이 없습니다."
                        else
                            git commit -m "🚀 Update image tag to ${IMAGE_TAG}

Build: #${BUILD_NUMBER}
Image: ${IMAGE_NAME}:${IMAGE_TAG}
Date: \$(date -u +'%Y-%m-%d %H:%M:%S UTC')"
                            
                            git push origin dev
                            
                            echo "✅ GitOps 매니페스트 업데이트 완료"
                        fi
                    """
                }
            }
        }
    }  // ← stages 블록 닫기
    
    post {
        always {
            sh '''
                docker logout ${HARBOR_URL} 2>/dev/null || true
                docker rmi ${IMAGE_NAME}:${IMAGE_TAG} ${IMAGE_NAME}:latest 2>/dev/null || true
                docker system prune -f
            '''
            echo '🏁 fanda-frontend GitOps 파이프라인 완료'
        }
        
        success {
            echo """
🎉 GitOps 빌드 성공!

결과 요약:
  프로젝트: ${env.PROJECT_NAME}
  이미지: ${env.IMAGE_NAME}:${env.IMAGE_TAG}
  Harbor: ${env.HARBOR_URL}/harbor/projects
  매니페스트: k8s/deployment.yaml 업데이트됨

다음 단계: ArgoCD가 Git 변경사항을 감지하여 자동 배포를 시작합니다 🚀
            """
        }
        
        failure {
            echo "❌ GitOps 빌드 실패! 로그를 확인하세요."
        }
    }
}
