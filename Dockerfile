# ===============================
# 1️⃣ Build Stage - React 빌드
# ===============================
FROM node:18-alpine AS builder

# 작업 디렉토리 설정
WORKDIR /app

# 패키지 파일만 먼저 복사 (캐시 최적화)
COPY package*.json ./

# 의존성 설치 (production + devDependencies 포함)
RUN npm ci --silent

# 소스 복사
COPY . .

# React 앱 빌드
RUN npm run build

# ===============================
# 2️⃣ Production Stage - Nginx
# ===============================
FROM nginx:1.27-alpine

# 환경 변수 설정 
ENV TZ=Asia/Seoul

# 보안 패치: libxml2 취약점 해결 (CVE-2025-32414, CVE-2025-32415)
RUN apk update && \
    apk upgrade && \
    apk add --no-cache \
        libxml2>=2.13.4-r6 \
        curl \
        tzdata && \
    rm -rf /var/cache/apk/* /tmp/*

# Nginx 기본 index 제거
RUN rm -rf /usr/share/nginx/html/*

# 1단계에서 빌드한 결과물 복사
COPY --from=builder /app/build /usr/share/nginx/html

# Nginx 설정 복사 
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# 보안 강화: 불필요한 파일 제거 및 권한 설정
RUN find /usr/share/nginx/html -type f -exec chmod 644 {} \; && \
    find /usr/share/nginx/html -type d -exec chmod 755 {} \; && \
    chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d

# 헬스체크 추가
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:80/ || exit 1

# USER nginx 제거 - 80포트 바인딩 문제로 root로 실행
# 참고: K8s 환경에서는 runAsNonRoot 정책으로 보안 강화 가능

# 포트 80 노출
EXPOSE 80

# nginx 실행
CMD ["nginx", "-g", "daemon off;"]