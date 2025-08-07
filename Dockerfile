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

# Nginx 기본 index 제거
RUN rm -rf /usr/share/nginx/html/*

# 1단계에서 빌드한 결과물 복사
COPY --from=builder /app/build /usr/share/nginx/html

# Nginx 설정 복사 
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# USER nginx 제거 - 80포트 바인딩 문제로 root로 실행
# RUN addgroup -S nginx && adduser -S nginx -G nginx
# USER nginx

# 포트 80 노출
EXPOSE 80

# nginx 실행
CMD ["nginx", "-g", "daemon off;"]