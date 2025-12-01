# ============================
# 1단계: 빌드 단계 (dev deps 포함)
# ============================
FROM node:20-alpine AS builder

# 필요하면 tz 설정
ENV TZ=Asia/Seoul

# 작업 디렉터리
WORKDIR /app

# 패키지 정보만 먼저 복사 → 캐시 활용
COPY package*.json ./

# devDependencies 포함해서 설치 (ts, eslint 등)
RUN npm ci

# 나머지 소스 복사
COPY . .

# TypeScript 빌드 (있으면)
# package.json 안에 "build": "tsc" 같은 스크립트가 있다고 가정
RUN npm run build --if-present

# ============================
# 2단계: 런타임 이미지 (prod 전용)
# ============================
FROM node:20-alpine AS runner

ENV NODE_ENV=production
ENV TZ=Asia/Seoul

WORKDIR /app

# prod 의존성만 설치
COPY package*.json ./
RUN npm ci --omit=dev

# 빌드 결과물 복사 (dist 기준)
# 👉 만약 빌드 결과 폴더가 dist가 아니라면 여기 경로만 바꿔줘
COPY --from=builder /app/dist ./dist

# (환경변수는 컨테이너 실행 시 -e 로 넣는 걸 추천, .env는 보통 COPY 안 함)
# EXPOSE는 문서용이라서 실제 포트 매핑은 -p 4000:4000 으로 해줘야 함
EXPOSE 8080

# 앱 시작
# package.json 에 "start": "node dist/index.js" 혹은 비슷한 스크립트가 있다고 가정
CMD ["npm", "start"]
