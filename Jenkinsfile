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
                    def author = sh(script: "git log -1 --pretty=%an", returnStdout: true).trim()
                    def commitMessage = sh(script: "git log -1 --pretty=%B", returnStdout: true).trim()

                    echo "=== 커밋 정보 ==="
                    echo "작성자: ${author}"
                    echo "메시지: ${commitMessage}"

                    // Jenkins CI가 작성한 커밋이면서 [skip ci]가 포함된 경우에만 스킵
                    if (author == "Jenkins CI" && commitMessage.contains('[skip ci]')) {
                        echo "Jenkins CI 자동 커밋 감지 - 파이프라인 스킵"
                        env.SKIP_ALL = 'true'
                        currentBuild.result = 'SUCCESS'
                        currentBuild.description = "자동 스킵"
                        return
                    }

                    // 개발자가 명시적으로 스킵을 요청한 경우
                    if (author != "Jenkins CI" && commitMessage.contains('[skip ci]')) {
                        echo "개발자 스킵 요청 - 파이프라인 스킵"
                        env.SKIP_ALL = 'true'
                        currentBuild.result = 'SUCCESS'
                        currentBuild.description = "개발자 스킵 요청"
                        return
                    }

                    env.SKIP_ALL = 'false'
                    echo "빌드 진행: ${author}의 커밋"
                }
            }
        }
        
        stage('환경 검증') {
            when { environment name: 'SKIP_ALL', value: 'false' }
            steps {
                echo "프론트엔드 빌드 시작: ${IMAGE_NAME}:${IMAGE_TAG}"
                sh '''
                    # 필수 파일 존재 확인
                    for file in package.json Dockerfile nginx/default.conf; do
                        [ ! -f "$file" ] && echo "필수 파일 누락: $file" && exit 1
                    done

                    # Docker 버전 확인
                    docker --version

                    echo "프론트엔드 환경 검증 완료"
                '''
            }
        }
        
        stage('이미지 중복 확인') {
            when { environment name: 'SKIP_ALL', value: 'false' }
            steps {
                script {
                    env.SKIP_BUILD = sh(
                        script: "docker manifest inspect ${IMAGE_NAME}:${IMAGE_TAG} >/dev/null 2>&1",
                        returnStatus: true
                    ) == 0 ? 'true' : 'false'
                    
                    echo env.SKIP_BUILD == 'true' ? 
                        "이미지 재사용: ${IMAGE_NAME}:${IMAGE_TAG}" : 
                        "새 이미지 빌드: ${IMAGE_NAME}:${IMAGE_TAG}"
                }
            }
        }
        
        stage('빌드 & 푸시') {
            when { 
                allOf {
                    environment name: 'SKIP_ALL', value: 'false'
                    environment name: 'SKIP_BUILD', value: 'false'
                }
            }
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'Harbor-credentials',
                    usernameVariable: 'HARBOR_USER',
                    passwordVariable: 'HARBOR_PASS'
                )]) {
                    sh '''
                        # Docker 이미지 빌드 (백엔드와 동일한 방식)
                        docker build -t ${IMAGE_NAME}:${IMAGE_TAG} \
                            --label "version=${IMAGE_TAG}" \
                            --label "build-date=$(date -u +'%Y-%m-%dT%H:%M:%SZ')" \
                            --label "service=frontend" .
                        
                        # Harbor 로그인 및 이미지 푸시
                        echo "${HARBOR_PASS}" | docker login ${HARBOR_URL} -u "${HARBOR_USER}" --password-stdin
                        docker push ${IMAGE_NAME}:${IMAGE_TAG}
                        
                        echo "프론트엔드 빌드 완료: ${IMAGE_NAME}:${IMAGE_TAG}"
                    '''
                }
            }
        }

        stage('배포 업데이트') {
            when { environment name: 'SKIP_ALL', value: 'false' }
            steps {
                script {
                    try {
                        sh '''
                            git config --global user.email "jenkins@company.com"
                            git config --global user.name "Jenkins CI"
                            git fetch origin && git checkout dev && git reset --hard origin/dev
                        '''
                        
                        def currentTag = sh(
                            script: "grep -o 'image: .*/frontend:.*' k8s/deployment.yaml | cut -d':' -f3 || echo 'none'",
                            returnStdout: true
                        ).trim()
                        
                        if (currentTag == env.IMAGE_TAG) {
                            echo "이미지 태그 동일 - 스킵"
                            return
                        }
                        
                        sh '''
                            sed -i "s|image: ${HARBOR_URL}/${PROJECT_NAME}/frontend:.*|image: ${HARBOR_URL}/${PROJECT_NAME}/frontend:${IMAGE_TAG}|g" k8s/deployment.yaml
                            git add k8s/deployment.yaml
                            git commit -m "Auto-update frontend image tag to ${IMAGE_TAG} [skip ci]"
                        '''
                        
                        withCredentials([usernamePassword(
                            credentialsId: 'github-credentials',
                            usernameVariable: 'GITHUB_USER',
                            passwordVariable: 'GITHUB_TOKEN'
                        )]) {
                            sh '''
                                git push https://${GITHUB_TOKEN}@github.com/T1F4-aws-cloud-school/fanda-frontend.git HEAD:dev
                                echo "Git 푸시 성공"
                            '''
                        }
                        
                        echo "배포 업데이트 완료 - ArgoCD가 배포를 진행합니다"
                        
                    } catch (Exception e) {
                        echo "배포 업데이트 실패: ${e.message}"
                        currentBuild.result = 'UNSTABLE'
                    }
                }
            }
        }

        // 🔥 프론트엔드 헬스체크 스테이지 추가
        stage('배포 후 헬스체크') {
            when { environment name: 'SKIP_ALL', value: 'false' }
            steps {
                script {
                    try {
                        sh '''
                            echo "🏥 프론트엔드 헬스체크 시작..."
                            
                            # ArgoCD 동기화 대기 (최대 3분)
                            echo "ArgoCD 동기화 대기 중..."
                            sleep 30
                            
                            # 프론트엔드 서비스 상태 확인
                            FRONTEND_URL="http://192.168.2.100:31199"
                            
                            for i in {1..6}; do
                                echo "헬스체크 시도 $i/6..."
                                
                                # HTTP 상태 코드 확인
                                HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" ${FRONTEND_URL} || echo "000")
                                
                                if [ "$HTTP_STATUS" = "200" ] || [ "$HTTP_STATUS" = "304" ]; then
                                    echo "✅ 프론트엔드 서비스 정상 (HTTP $HTTP_STATUS)"
                                    
                                    # 기본 컨텐츠 확인
                                    if curl -s ${FRONTEND_URL} | grep -q "세 끼 통 살"; then
                                        echo "✅ 프론트엔드 컨텐츠 로드 확인"
                                        exit 0
                                    fi
                                fi
                                
                                echo "⏳ 30초 후 재시도... (HTTP $HTTP_STATUS)"
                                sleep 30
                            done
                            
                            echo "⚠️ 헬스체크 타임아웃 - 수동 확인 필요"
                            exit 1
                        '''
                    } catch (Exception e) {
                        echo "⚠️ 헬스체크 실패: ${e.message}"
                        echo "배포는 완료되었지만 서비스 상태를 확인해주세요."
                        currentBuild.result = 'UNSTABLE'
                    }
                }
            }
        }
    }
    
    post {
        always {
            script {
                if (env.SKIP_ALL != 'true') {
                    sh '''
                        # Docker 정리
                        docker logout ${HARBOR_URL} 2>/dev/null || true
                        docker rmi ${IMAGE_NAME}:${IMAGE_TAG} 2>/dev/null || true
                        docker system prune -f --volumes
                    '''
                }
            }
        }
        success {
            script {
                if (env.SKIP_ALL == 'true') {
                    echo "자동 스킵 완료"
                } else if (env.SKIP_BUILD == 'true') {
                    echo "이미지 재사용 성공"
                } else {
                    echo "프론트엔드 CI/CD 성공 🎉"
                    echo "배포된 이미지: ${IMAGE_NAME}:${IMAGE_TAG}"
                    echo "서비스 URL: http://192.168.2.100:31199"
                }
            }
        }
        unstable { 
            echo "빌드 성공, 일부 단계 실패 (Git 업데이트 또는 헬스체크)"
            echo "수동으로 서비스 상태를 확인해주세요: http://192.168.2.100:31199"
        }
        failure { 
            echo "프론트엔드 빌드 실패 ❌"
            echo "로그를 확인하고 문제를 해결해주세요."
        }
        cleanup { 
            sh 'docker container prune -f || true'
        }
    }
}