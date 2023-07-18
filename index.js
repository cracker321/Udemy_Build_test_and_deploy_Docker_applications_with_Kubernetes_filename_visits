// [ 49강~ ]

//- 'index.js'는 Node.js 애플리케이션의 시작점임.
//  즉, Node.js로 작성된 서버 애플리케이션을 실행하기 위해서는 index.js 파일이 실행되어야 함.
//  index.js파일은 서버 애플리케이션에서 필요한 다양한 모듈을 로드하고, 서버를 실행시키는 코드가 작성되어 있는 중요한 파일임.
//  index.js파일에서는 필수 모듈인 HTTP 모듈이나 Express.js와 같은 웹 프레임워크를 사용하여 서버를 사용하고, 서버 동작에 대한 코드 작성됨.
//- 'Express 웹 서버'와 'Redis 클라이언트'를 사용하여 간단한 방문자 카운터 서비스 구축 프로젝트.
//- Express는 Node.js를 사용하여 웹 서버를 빠르게 만들 수 있는 프레임워크임.


//===================================================================================================================

//< 'docker-compose.yml 파일', 'Dockerfile 파일', 'index.js 파일'의 연계적인 작동 순서, 과정 >

//순서1) '명령어 docker-compose up'을 실행하여,
//순서1) 'docker-compose.yml'이 실행되며 Docker Compose가 2개의 서비스(Reids 서버, Express 애플리케이션)를 함께 실행시킴.
//       '서비스 redis-server'는 '이미지 redis'를 사용하여 Docker Hub에서 이미지를 받아와서 Redis 서버를 실행시키고,
//       '서비스 node-app'은 현재 Dockerfile의 디렉토리를 기반으로 도커 이미지를 빌드하고, 호스트의 포트번호 4001을
//       컨테이너의 포트번호 8081로 매핑시킴.
//순서2) 'index.js'는 Express 서버를 생성하고, 클라언트로부터 들어온 GET 요청을 처리함.
//순서3) 'index.js'는 Redis 서버에 GET/SET 요청을 보내어 데이터를 조회(GET)하고, 수정(SET)함.



/* 
< index.js >
- 웹 애플리케이션의 로직을 구현한 코드
- docker-compose.yml 설정을 통해 '서비스 node-app'으로 정의되고 실행됨.


< Dockerfile >
- 웹 애플리케이션 로직(index.js 파일)을 실행시키기 위해 필요한 도커 이미지를 정의함.
  즉, '서비스 node-app'에 적용될 베이스 이미지 빌드 방법을 정의한 것임.


< docker-compose.yml >
- 두 서비스(컨테이너)인 redis-server(Redis 클라인트와 Redis 서버 간 연결 담당), 
  node-app(웹 애플리케이션 로직 index.js 파일 실행. Dockerfile을 토대로 빌드된 이미지 사용)을 관리하는 설정 제공. 
*/


//===================================================================================================================

//# 'Express 라이브러리(모듈)'를 가져옴.
//- 웹 애플리케이션의 라우팅 및 미들웨어를 처리
//- Express 모듈을 가지고 와서, 이를 사용할 수 있도록 변수 express에 할당하고 있음.
const express = require('express'); 


//# 'Redis 라이브러리(모듈)'를 가져옴.
//- 저장소로서의 역할. 방문 횟수를 저장함. in-memory 데이터 구조를 배포하고 검색할 수 있음.
//- Redis 모듈을 가지고 와서, 이를 사용할 수 있도록 변수 redis에 할당하고 있음.
const redis = require('redis'); 


const process = require('process');


//# Express 웹 서버 구축 프레임워크를 사용하기 위한 설정
//- 'Express 앱 객체'를 생성하고 초기화함.
//  이 객체는 모든 Express 기능을 포함하여 서버를 시작하고 요청 라우팅을 처리함.
//- '함수 express()'를 호출하여, Express의 앱(app) 인스턴스를 생성함. 
//  이 인스턴스를 사용하여 라우트, 미들웨어 설정, 앱의 시작 중지 등의 작업이 가능함.
const app = express(); //Express의 객체(인스턴스)를 생성함.


//===================================================================================================================


//< Redis 데이터베이스를 사용하기 위한 패키지 >

//- 'Redis 클라이언트' 인스턴스를 생성하고 Reids 서버와의 연결하는 클라이언트를 생성하는 코드임.
//-  연결은 host와 port 옵셥을 사용하여 설정함.

//--------------------------------------------------------------------------------------------------------------------

//< Redis Client >

//- 'Redis Client'는, 'Reids 서버(데이터베이스)'에 연결하여 데이터를 조회, 저장, 수정, 삭제 등을 하는 데 사용되는 라이브러리임.
//- Redis 서버와 통신하기 위한 API를 제공함.
//- 다양한 언어에 대한 Redis Client가 있고 제공됨. e.g) Node.js, Python, Java, C# 등


//# 'const client = redis.createClient({...})'
//- 'Redis Client'를 생성함. 
const client = redis.createClient({

    //# Redis Client의 세부 설정
    
    //*****중요*****
    //Redis 서버의 위치
    //- 'docker-compose.yml 파일'의 'redis-server'으로 정확하게 리디렉티드 되어서 현재 이미 실행 중인 Redis 서버와 연결되어
    //  이제 통신이 가능해지는 것임.
    //  이것을 통해서 비로소 'index.js 기반의 서비스 node-app'과 '서비스 redis-server'가 서로 연결 통신되어
    //  Docker Compose가 이 두 컨테이너를 관리할 수 있게 되는 것이다!
    host: 'redis-server', //아래를 대신해서 이렇게 짧게 대체해줄 수 있음.
    //host: 'https://my-redis-server.com'
    
    //Redis 서버 포트(최초 기본값 포트번호는 6379임)
    port: 6379

}); // Redis서버를 향하는 '(네트워크)connection'을 의미.


client.set('visits', 0); //초기화

//===================================================================================================================


//< Express.js에서의 라우트 핸들러 >

//- 'Express.js에서의 app.get('/')'은 '스프링에서의 @GetMapping('/')'과 같은 역할, 기능임.
//- HTTP메소드(GET, POST, PUT, DELETE 등)와 URL 경로를 기반으로 클라이언트의 요청을 라우팅함.
//- 순서1) 클라이언트가 특정 URL 경로로 요청을 보냄
//  순서2) Express 웹 서버는 그 요청을 받아서 라우팅 프레임워크나 라우팅 라이브러리에 등록된 라우트 핸들러를 찾음.
//  순서3) URL 경로와 일치하는 라우트 핸들러르 찾으면, 해당 핸들러 함수가 실행됨.
//  순서4) 핸들러 함수는 요청(req)과 관련된 데이터를 받아와서 처리하고, 필요한 응답(res)을 반환함.
//  순서5) 웹 서버는 핸들러 함수가 반환한 응답(res)를 클라이언트에게 전송함.

//===================================================================================================================

//< 라우트 핸들러에서의 req와 res >

//# req 객체

//- 클라이언트로부터 서버로 들어온 HTTP 요청(request) 정보가 담긴 객체.
//  이 req 객체를 통해 URL 매개변수, 쿼리 문자열, 요청 헤더 등을 추출할 수 있음.
//  URL, 헤더, 요청 본문(RequestBody), 요청 메소드(GET, POST, PUT, DELETE 등), 쿠키 등의 요청 request과 관련된 모든 정보를 담고 있음.
//- 클라이언트가 HTTP 요청을 보내면, 라우트 핸들러는 해당 요청을 받아 'req 객체'에 담음.
//  이렇게 생성된 'req 객체'를 처리한 후, 그 결과를 'res 객체'에 설정하여 서버에서 클라이언트에게 응답(response)를 전송함.
//- req 객체의 주요 내장 속성
//  * req.url: 요청 URL 전체를 반환함.
//  * req.params: 요청 URL 경로의 파라미터 값들을 객체 형태로 저장함.
//  * req.query: 쿼리스트링 파라미터 값을 객체 형태로 저장함.
//  * req.body: 요청 본문(Request Body)의 데이터를 객체 형태로 저장함.
//  * req.cookies: 클라이언트로부터 들어온 쿠키 정보를 객체 형태로 저장함.
//  * req.header: 특정 요청의 헤더 값을 가져옴. e.g) req.header('Content-Type')


//# res 객체

//- 서버가 클라이언트에게 반환할 결과를 설정하는 객체임. 이 객체를 사용해 응답과 관련된 작업을 처리함.
//- req 객체의 주요 내장 속성
//  * res.send([body]): 응답 본문(Response Body)을 설정하고, 응답을 클라이언트에게 보냄.
//  * res.status(code): 응답 상태 코드를 설정함.
//  * res.json(ob): JSON 객체를 응답 본문으로 설정하고, 응답을 클라이언트에게 보냄.
//  * res.setHeader(name, value): 응답 헤더를 설정함.
//  * res.cookie(name, value, [options]): 쿠키를 설정함.
//  * res.redirect([status], url): 클라이언트를 다른 경로로 리다이렉트함.

//--------------------------------------------------------------------------------------------------------------------


//- 'Express.js에서의 app.get('/')'은 '스프링에서의 @GetMapping('/')'과 같은 역할, 기능임.
//- 루트 라우트('/')에 대한 GET 요청을 처리함.
app.get('/', (req, res) => { 


    process.exit(41704170); //0만 아니라면 어떤 숫자든 입력해도


    //'Redis 서버'에 저장된 '키 visits'의 '값(value)'를 가져온다.
    //즉, Reids 서버로부터 visit 횟수를 가져와서, 페이지를 로드할 때마다 증가시킴.
    client.get('visits', (err, visits) => {

        res.send('Number of visits is ' + visits);
    
        //'visits'의 값을 증가시킴.
        client.set('visits', parseInt(visits) + 1);
    });

}) //'라우트 핸들러'. '루트 라우트('/')'.


//서버를 '포트 8081'에서 실행시킨다.
//(Express 앱이 포트 8081에서 대기하도록 설정함)
app.listen(8081, () => {

    //서버가 시작되면 콘솔에 'Listening on port 8081'이 출력된다.
    console.log('Listening on port 8081')
});

