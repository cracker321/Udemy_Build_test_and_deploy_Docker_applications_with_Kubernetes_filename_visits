# [ 50강 ]

# < index.js >
# - 웹 애플리케이션의 로직을 구현한 코드
# - docker-compose.yml 설정을 통해 '서비스 node-app'으로 정의되고 실행됨.

# < Dockerfile >
# - 웹 애플리케이션 로직(index.js 파일)을 실행시키기 위해 필요한 도커 이미지를 정의함.
#   즉, '서비스 node-app'에 적용될 베이스 이미지 빌드 방법을 정의한 것임.

# < docker-compose.yml >
# - 두 서비스(컨테이너)인 redis-server(Redis 클라인트와 Redis 서버 간 연결 담당), 
#   node-app(웹 애플리케이션 로직 index.js 파일 실행. Dockerfile을 토대로 빌드된 이미지 사용)을 관리하는 설정 제공.


FROM node:alpine



# '작업 디렉토리 /app' 생성
WORKDIR '/app' 


# 
COPY package.json .

RUN npm install

COPY . .


CMD ["npm", "start"]