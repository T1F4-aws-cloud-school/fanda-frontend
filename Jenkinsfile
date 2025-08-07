pipeline {
    agent any
    
    environment {
        HARBOR_URL = '192.168.2.111'
        PROJECT_NAME = 'fanda-fe'
        IMAGE_NAME = "${HARBOR_URL}/${PROJECT_NAME}/frontend"
        // Git 커밋 해시 사용 (코드 변경이 있을 때만 달라짐)
        IMAGE_TAG = "${env.GIT_COMMIT.take(8)}"
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
        
        stage('이미지 중복 확인') {
            steps {
                script {
                    // 동일한 커밋 해시로 이미 이미지가 있는지 확인
                    def imageExists = sh(
                        script: "docker manifest inspect ${IMAGE_NAME}:${IMAGE_TAG} > /dev/null 2>&1",
                        returnStatus: true
                    ) == 0
                    
                    if (imageExists) {
                        echo "📦 이미지 이미 존재: ${IMAGE_NAME}:${IMAGE_TAG}"
                        echo "🔄 기존 이미지 재사용 - 빌드 스킵"
                        env.SKIP_BUILD = 'true'
                    } else {
                        echo "🆕 새 이미지 빌드 필요: ${IMAGE_NAME}:${IMAGE_TAG}"
                        env.SKIP_BUILD = 'false'
                    }
                }
            }
        }
        
        stage('빌드 & 푸시') {
            when {
                environment name: 'SKIP_BUILD', value: 'false'
            }
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
        
        stage('Security Scan (Trivy)') {
            when {
                environment name: 'SKIP_BUILD', value: 'false'
            }
            steps {
                sh '''
                    echo "🔐 Trivy 보안 스캔 시작..."
                    trivy image \
                        --server http://192.168.2.248:4954 \
                        --exit-code 1 \
                        --severity HIGH,CRITICAL \
                        ${IMAGE_NAME}:${IMAGE_TAG}
                '''
            }
        }

        stage('배포 파일 업데이트') {
            when {
                // [skip ci] 커밋은 배포 파일 업데이트 스킵
                not { changelog '.*\\[skip ci\\].*' }
            }
            steps {
                script {
                    try {
                        // Git 설정
                        sh '''
                            git config --global user.email "jenkins@company.com"
                            git config --global user.name "Jenkins CI"
                        '''
                        
                        sh """
                            echo "=== Git 상태 진단 ==="
                            git status
                            git branch -a
                            echo "현재 브랜치: \$(git branch --show-current || echo 'detached')"
                            
                            # dev 브랜치로 확실히 checkout
                            git fetch origin
                            git checkout dev
                            git reset --hard origin/dev
                            
                            echo "=== dev 브랜치 확인 ==="
                            echo "현재 브랜치: \$(git branch --show-current)"
                            git log --oneline -3
                        """
                        
                        // 실제 코드 변경 확인
                        def shouldUpdate = sh(
                            script: """
                                echo "=== 코드 변경 확인 ==="
                                
                                # 현재 deployment.yaml의 이미지 태그 확인
                                CURRENT_TAG=\$(grep -o 'image: .*/frontend:.*' k8s/deployment.yaml | cut -d':' -f3)
                                echo "현재 태그: \$CURRENT_TAG"
                                echo "새 태그: ${IMAGE_TAG}"
                                
                                # 이미 같은 태그면 스킵
                                if [ "\$CURRENT_TAG" = "${IMAGE_TAG}" ]; then
                                    echo "이미지 태그 동일 - 업데이트 불필요"
                                    exit 1
                                fi
                                
                                # 실제 애플리케이션 코드 변경이 있는지 확인 (최근 2개 커밋 비교)
                                if git diff --quiet HEAD~1 HEAD -- . ':!k8s/deployment.yaml' ':!k8s/*'; then
                                    echo "애플리케이션 코드 변경 없음 - deployment.yaml 업데이트 불필요"
                                    exit 1
                                fi
                                
                                echo "코드 변경 감지 - deployment.yaml 업데이트 필요"
                                exit 0
                            """,
                            returnStatus: true
                        ) == 0
                        
                        if (!shouldUpdate) {
                            echo "⏭️ 업데이트 불필요 - 스킵"
                            return
                        }
                        
                        // deployment.yaml 이미지 태그 업데이트
                        sh """
                            echo "=== 이미지 태그 업데이트 ==="
                            
                            # 현재 이미지 확인
                            echo "변경 전:"
                            grep "image:" k8s/deployment.yaml
                            
                            # 이미지 태그 변경
                            sed -i 's|image: ${HARBOR_URL}/${PROJECT_NAME}/frontend:.*|image: ${HARBOR_URL}/${PROJECT_NAME}/frontend:${IMAGE_TAG}|g' k8s/deployment.yaml
                            
                            # 변경 후 확인
                            echo "변경 후:"
                            grep "image:" k8s/deployment.yaml
                            
                            # Git 변경사항 확인
                            git status
                            git diff k8s/deployment.yaml
                        """
                        
                        // Git 커밋 및 푸시
                        withCredentials([usernamePassword(
                            credentialsId: 'github-credentials', 
                            usernameVariable: 'GITHUB_USER',
                            passwordVariable: 'GITHUB_TOKEN'
                        )]) {
                            sh """
                                echo "=== Git 커밋 & 푸시 ==="
                                
                                # 변경사항이 있는지 확인
                                if git diff --quiet k8s/deployment.yaml; then
                                    echo "변경사항 없음 - 스킵"
                                else
                                    echo "변경사항 감지 - 업데이트 진행"
                                    
                                    # 스테이징
                                    git add k8s/deployment.yaml
                                    
                                    # 커밋 (skip ci 태그로 순환 방지)
                                    git commit -m "🚀 Auto-update image tag to ${IMAGE_TAG} [skip ci]"
                                    
                                    # dev 브랜치에 푸시
                                    git push https://${GITHUB_TOKEN}@github.com/T1F4-aws-cloud-school/fanda-frontend.git HEAD:dev
                                    
                                    echo "✅ Git 푸시 성공"
                                    
                                    # 결과 확인
                                    echo "=== 푸시 후 상태 ==="
                                    git log --oneline -3
                                    git status
                                fi
                            """
                        }
                        
                        echo "✅ 배포 파일 업데이트 완료"
                        echo "🔄 ArgoCD가 dev 브랜치 변경을 감지하여 자동 배포합니다"
                        echo "⏱️ 약 3분 내에 새로운 이미지로 배포될 예정입니다"
                        
                    } catch (Exception e) {
                        echo "⚠️ 배포 파일 업데이트 실패: ${e.message}"
                        echo "🔍 로그를 확인하여 문제를 해결해주세요"
                        // 실패해도 빌드는 성공으로 처리 (이미지는 정상적으로 생성됨)
                        currentBuild.result = 'UNSTABLE'
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
            script {
                if (env.SKIP_BUILD == 'true') {
                    echo """
🎯 이미지 재사용 성공!

                    """
                } else {
                    echo """
🎉 완전 자동화 성공!

                    """
                }
            }
        }
        
        unstable {
            echo """
⚠️ 빌드 성공, Git 업데이트 실패


🛠️ 자동 복구 시도 또는 로그 확인 필요
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