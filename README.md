# 자작곡 라이브러리

GitHub Pages에 배포하는 정적 자작곡 포트폴리오입니다. HTML, CSS, ES Module JavaScript만 사용하며 빌드 단계나 외부 의존성이 없습니다.

## 주요 기능

- `songs.json` 기반의 곡·사이트 정보 자동 렌더링
- 제작자 소개, 곡 정보, 제작 배경 아코디언
- YouTube 새 탭 링크, 반응형 밤하늘 카드 UI
- 키보드 조작, 스킵 링크, ARIA 상태 동기화
- 모션 감소 환경과 화면 크기를 고려한 애니메이션

## 로컬 실행

ES Module의 `fetch()`를 사용하므로 `index.html` 파일을 직접 열지 말고 정적 웹 서버에서 실행해야 합니다. 예를 들어 Python이 설치되어 있다면 프로젝트 루트에서 아래 명령을 실행합니다.

```bash
python -m http.server 8000
```

그 후 `http://localhost:8000`에 접속합니다.

## 데이터 관리

모든 사이트·곡 데이터는 `songs.json`에서 관리합니다. 아래 구조를 유지한 채 `songs` 배열에 곡을 추가합니다.

```json
{
    "site": {
        "title": "자작곡 라이브러리",
        "author": {
            "name": "구자현",
            "intro": "제작자 소개"
        }
    },
    "songs": [
        {
            "id": "unique-song-id",
            "title": "곡 제목",
            "lyricist": "작사가",
            "composer": "작곡가",
            "lyrics": "가사",
            "story": "제작 배경",
            "youtubeUrl": "https://www.youtube.com/watch?v=..."
        }
    ]
}
```

- `site.title`, `site.author.name`은 비어 있을 수 없고, `site.author.intro`는 빈 문자열을 허용합니다.
- `id`는 문자열이며, `title`, `lyricist`, `composer`와 함께 비어 있을 수 없습니다.
- `lyrics`와 `story`는 빈 문자열을 허용합니다.
- `youtubeUrl`은 HTTPS URL 또는 `null`입니다.
- `id`는 곡마다 고유해야 합니다.

## 프로젝트 구조

```text
.
├── index.html          # 페이지 구조와 렌더링 템플릿
├── style.css           # 디자인 토큰과 반응형 스타일
├── songs.json          # 사이트·곡 데이터 단일 소스
├── js/
│   ├── app.js          # 앱 초기화
│   ├── dom.js          # DOM 캐시
│   ├── songService.js  # 데이터 요청과 검증
│   ├── renderer.js     # 데이터 기반 DOM 렌더링
│   ├── templates.js    # 템플릿 복제와 데이터 주입
│   └── ui.js           # 이벤트 위임과 애니메이션
├── fonts/              # Batang 웹폰트
└── icons/              # SVG 자산
```

## GitHub Pages 배포

1. 이 프로젝트를 GitHub 저장소의 기본 브랜치(예: `main`) 루트에 푸시합니다.
2. 저장소의 **Settings → Pages**로 이동합니다.
3. **Build and deployment**의 Source에서 **Deploy from a branch**를 선택합니다.
4. 배포 브랜치로 `main`, 폴더로 `/(root)`를 선택하고 저장합니다.
5. 배포가 완료되면 `https://<GitHub-사용자명>.github.io/<저장소명>/`에서 확인합니다.

모든 내부 자산 경로가 상대 경로라 프로젝트 Pages URL에서도 별도 경로 수정 없이 동작합니다. 자세한 설정은 [GitHub Pages 배포 원본 설정 문서](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)를 참고하세요.

## 유지보수

- 곡 추가·수정은 `songs.json`만 변경합니다.
- 데이터 필드 변경 시 `js/songService.js`, `js/templates.js`, `js/renderer.js`, README를 함께 갱신합니다.
- 사용자 인터랙션 변경 시 ARIA 속성과 키보드 동작도 함께 검토합니다.
