# ===== 빌드 단계 =====
# Node.js 18 사용 (React 19 지원)
FROM node:18-alpine AS builder

# 작업 디렉토리 설정
WORKDIR /app

# package.json과 package-lock.json 복사 (Docker 캐시 최적화)
COPY package*.json ./

# 의존성 설치 (npm ci는 package-lock.json 기반으로 정확한 버전 설치)
RUN npm ci --only=production

# 소스 코드 전체 복사
COPY . .

# Create React App 빌드 (build/ 폴더 생성됨)
RUN npm run build

# ===== 실행 단계 =====
# 경량 nginx 이미지 사용
FROM nginx:alpine

# CRA 빌드 결과물을 nginx가 서빙할 위치로 복사
COPY --from=builder /app/build /usr/share/nginx/html

# React Router 지원을 위한 nginx 설정
# (SPA에서 /login, /signup 등 경로 새로고침 시 404 방지)
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html index.htm; \
    \
    # React Router를 위한 fallback 설정 \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    \
    # API 요청은 백엔드로 프록시 (나중에 백엔드 연결시 사용) \
    location /api { \
        proxy_pass http://fanda-backend-service:8080; \
        proxy_set_header Host $host; \
        proxy_set_header X-Real-IP $remote_addr; \
    } \
    \
    # 정적 파일 캐싱 설정 \
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ { \
        expires 1y; \
        add_header Cache-Control "public, immutable"; \
        add_header Access-Control-Allow-Origin "*"; \
    } \
    \
    # 보안 헤더 추가 \
    add_header X-Frame-Options "SAMEORIGIN" always; \
    add_header X-Content-Type-Options "nosniff" always; \
    add_header X-XSS-Protection "1; mode=block" always; \
    \
    # gzip 압축 설정 \
    gzip on; \
    gzip_vary on; \
    gzip_min_length 1024; \
    gzip_proxied expired no-cache no-store private must-revalidate auth; \
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json; \
}' > /etc/nginx/conf.d/default.conf

# 포트 80 노출
EXPOSE 80

# nginx 실행
CMD ["nginx", "-g", "daemon off;"]