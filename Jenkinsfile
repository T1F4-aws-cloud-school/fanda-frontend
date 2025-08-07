pipeline {
    agent any
    
    environment {
        HARBOR_URL = '192.168.2.111'
        PROJECT_NAME = 'fanda-fe'
        IMAGE_NAME = "${HARBOR_URL}/${PROJECT_NAME}/frontend"
        IMAGE_TAG = "${env.GIT_COMMIT.take(8)}"
        DOCKER_BUILDKIT = '1'
    }
    
    options {
        buildDiscarder(logRotator(numToKeepStr: '10', daysToKeepStr: '30'))
        disableConcurrentBuilds()
        timeout(time: 20, unit: 'MINUTES')
    }
    
    stages {
        stage('트리거 검증') {
            steps {
                script {
                    // Jenkins CI 커밋인지 확인
                    def author = sh(
                        script: "git log -1 --pretty=%an",
                        returnStdout: true
                    ).trim()
                    
                    // [skip ci] 태그 확인
                    def commitMessage = sh(
                        script: "git log -1 --pretty=%B",
                        returnStdout: true
                    ).trim()
                    
                    echo "👤 커밋 작성자: ${author}"
                    echo "📝 커밋 메시지: ${commitMessage}"
                    
                    // Jenkins CI가 만든 커밋이거나 [skip ci] 태그가 있으면 종료
                    if (author == "Jenkins CI" || commitMessage.contains('[skip ci]')) {
                        echo "⏭️ 자동 커밋 감지 - 파이프라인 종료"
                        currentBuild.result = 'SUCCESS'
                        currentBuild.description = "🔄 Jenkins CI 커밋 - 자동 스킵"
                        error("정상적인 스킵 - Jenkins CI 커밋")
                    }
                    
                    echo "✅ 개발자 커밋 확인 - 파이프라인 계속 진행"
                }
            }
        }
        
        stage('환경 검증') {
            steps {
                echo "🚀 빌드 시작: ${IMAGE_NAME}:${IMAGE_TAG}"
                sh '''
                    echo "빌드 환경: Docker $(docker --version | cut -d' ' -f3), Git ${GIT_COMMIT}"
                    for file in package.json Dockerfile nginx/default.conf; do
                        [ ! -f "$file" ] && echo "❌ $file 없음" && exit 1
                    done
                    echo "✅ 환경 검증 완료"
                '''
            }
        }
        
        stage('이미지 중복 확인') {
            steps {
                script {
                    env.SKIP_BUILD = sh(
                        script: "docker manifest inspect ${IMAGE_NAME}:${IMAGE_TAG} >/dev/null 2>&1",
                        returnStatus: true
                    ) == 0 ? 'true' : 'false'
                    
                    echo env.SKIP_BUILD == 'true' ? 
                        "📦 이미지 재사용: ${IMAGE_NAME}:${IMAGE_TAG}" : 
                        "🆕 새 이미지 빌드: ${IMAGE_NAME}:${IMAGE_TAG}"
                }
            }
        }
        
        stage('빌드 & 푸시') {
            when { environment name: 'SKIP_BUILD', value: 'false' }
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'Harbor-credentials',
                    usernameVariable: 'HARBOR_USER',
                    passwordVariable: 'HARBOR_PASS'
                )]) {
                    sh '''
                        docker build -t ${IMAGE_NAME}:${IMAGE_TAG} -t ${IMAGE_NAME}:latest \
                            --label "version=${IMAGE_TAG}" \
                            --label "build-date=$(date -u +'%Y-%m-%dT%H:%M:%SZ')" .
                        
                        echo "${HARBOR_PASS}" | docker login ${HARBOR_URL} -u "${HARBOR_USER}" --password-stdin
                        docker push ${IMAGE_NAME}:${IMAGE_TAG}
                        docker push ${IMAGE_NAME}:latest
                        
                        echo "✅ 빌드 완료: ${IMAGE_NAME}:${IMAGE_TAG}"
                    '''
                }
            }
        }
        
        stage('보안 스캔') {
            when { environment name: 'SKIP_BUILD', value: 'false' }
            steps {
                sh '''
                    echo "🔐 Trivy 보안 스캔..."
                    trivy image --server http://192.168.2.248:4954 \
                        --exit-code 1 --severity HIGH,CRITICAL ${IMAGE_NAME}:${IMAGE_TAG}
                '''
            }
        }

        stage('배포 업데이트') {
            steps {
                script {
                    try {
                        sh '''
                            git config --global user.email "jenkins@company.com"
                            git config --global user.name "Jenkins CI"
                            git fetch origin && git checkout dev && git reset --hard origin/dev
                        '''
                        
                        def currentTag = sh(
                            script: "grep -o 'image: .*/frontend:.*' k8s/deployment.yaml | cut -d':' -f3",
                            returnStdout: true
                        ).trim()
                        
                        if (currentTag == env.IMAGE_TAG) {
                            echo "⏭️ 이미지 태그 동일 - 스킵"
                            return
                        }
                        
                        def hasCodeChanges = sh(
                            script: "git diff --quiet HEAD~1 HEAD -- . ':!k8s/deployment.yaml' ':!k8s/*'",
                            returnStatus: true
                        ) != 0
                        
                        if (!hasCodeChanges) {
                            echo "⏭️ 코드 변경 없음 - 스킵"
                            return
                        }
                        
                        sh '''
                            sed -i "s|image: ${HARBOR_URL}/${PROJECT_NAME}/frontend:.*|image: ${HARBOR_URL}/${PROJECT_NAME}/frontend:${IMAGE_TAG}|g" k8s/deployment.yaml
                            git add k8s/deployment.yaml
                            git commit -m "🚀 Auto-update image tag to ${IMAGE_TAG} [skip ci]"
                        '''
                        
                        withCredentials([usernamePassword(
                            credentialsId: 'github-credentials',
                            usernameVariable: 'GITHUB_USER',
                            passwordVariable: 'GITHUB_TOKEN'
                        )]) {
                            sh '''
                                git push https://${GITHUB_TOKEN}@github.com/T1F4-aws-cloud-school/fanda-frontend.git HEAD:dev
                                echo "✅ Git 푸시 성공"
                            '''
                        }
                        
                        echo "✅ 배포 업데이트 완료 - ArgoCD가 3분 내 배포합니다"
                        
                    } catch (Exception e) {
                        echo "⚠️ 배포 업데이트 실패: ${e.message}"
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
        }
        success {
            script {
                if (currentBuild.description?.contains("자동 스킵")) {
                    echo "⏭️ Jenkins CI 커밋으로 인한 정상 스킵"
                } else if (env.SKIP_BUILD == 'true') {
                    echo "🎯 이미지 재사용 성공!"
                } else {
                    echo "🎉 완전 자동화 성공!"
                }
            }
        }
        unstable { echo "⚠️ 빌드 성공, Git 업데이트 실패" }
        failure { echo "❌ 빌드 실패!" }
        cleanup { sh 'docker container prune -f || true' }
    }
}