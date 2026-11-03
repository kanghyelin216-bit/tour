# My Guestbook

GitHub Pages + Google Apps Script + Google Sheets로 만드는 공개 방명록입니다.

## 파일 구성
- `index.html`: 화면 구조
- `style.css`: 반응형 디자인
- `config.js`: GAS 웹 앱 URL 설정
- `script.js`: 방명록 조회/등록 및 화면 처리
- `Code.gs`: Google Apps Script 백엔드

## 1. Google Sheets 준비
1. 새 Google 스프레드시트를 만듭니다.
2. 주소에서 `/d/`와 `/edit` 사이의 문자열을 복사합니다.
3. `Code.gs`의 `SPREADSHEET_ID`에 붙여넣습니다.
4. 첫 요청 때 `Guestbook` 시트와 헤더가 자동 생성됩니다.

## 2. GAS 배포
1. https://script.google.com/ 에서 새 프로젝트를 만듭니다.
2. 제공된 `Code.gs` 내용을 붙여넣고 저장합니다.
3. `배포 > 새 배포 > 웹 앱`을 선택합니다.
4. 실행 사용자: 나
5. 액세스 권한: 모든 사용자
6. 배포 후 `/exec`로 끝나는 웹 앱 URL을 복사합니다.

웹 앱을 모든 사용자에게 공개하면 누구나 엔드포인트를 호출할 수 있습니다.
공개 데이터만 저장하고, 민감한 개인정보는 수집하지 마세요.

## 3. 프론트엔드 설정
`config.js`의 `GAS_WEB_APP_URL`에 배포 URL을 입력합니다.

## 4. GitHub Pages 배포
1. GitHub에서 새 Public 저장소를 만듭니다.
2. `index.html`, `style.css`, `config.js`, `script.js`를 저장소 루트에 올립니다.
3. 저장소의 Settings > Pages로 이동합니다.
4. Build and deployment에서 Deploy from a branch 선택
5. Branch: `main`, Folder: `/ (root)` 선택 후 Save
6. 제공된 GitHub Pages 주소로 접속합니다.

## 작동 방식
- 조회: JSONP GET 요청으로 최근 100개 항목을 조회
- 등록: JSONP GET 요청으로 항목을 추가
- 자동 갱신: 15초마다 목록을 다시 조회
- 입력 제한: 이름 30자, 메시지 300자
- 브라우저별 간단한 10초 요청 제한

## 보안 및 운영상 한계
이 예제는 학습용 공개 방명록입니다.
- JSONP는 읽기와 쓰기를 GET으로 처리하므로 공개·저위험 데이터에만 사용하세요.
- 브라우저의 clientId 기반 제한은 쉽게 우회할 수 있어 강력한 스팸 방지책이 아닙니다.
- 실제 서비스라면 Netlify/Vercel Functions 같은 서버 측 프록시, CAPTCHA, 서버 측 속도 제한, 관리자 삭제 기능을 추가하세요.
- 출력은 `textContent`를 사용해 HTML 삽입을 방지합니다.
- GAS 웹 앱을 수정한 경우 배포 관리에서 새 버전으로 업데이트해야 할 수 있습니다.
