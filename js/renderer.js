import { dom } from "./dom.js";
import { loadSongLibrary } from "./songService.js";
import {
    createEmptyState,
    createErrorMessage,
    createIntroCard,
    createSongCard
} from "./templates.js";

/**
 * songs.json을 읽고 제작자 소개와 곡 목록을 DOM에 렌더링합니다.
 * @returns {Promise<{ site: { title: string, author: { name: string, intro: string } }, songs: Array }>}
 */
export async function renderLibrary() {
    const library = await loadSongLibrary();

    renderLibraryData(library);

    return library;
}

/**
 * 검증이 끝난 데이터를 DocumentFragment로 한 번에 반영합니다.
 * @param {{ site: { title: string, author: { name: string, intro: string } }, songs: Array }} library
 */
function renderLibraryData(library) {
    renderSiteData(library.site);
    dom.introPanel.replaceChildren(dom.introHeading, createIntroCard(library.site.author));

    const songCards = document.createDocumentFragment();

    if (library.songs.length === 0) {
        songCards.append(createEmptyState());
    } else {
        library.songs.forEach((song) => songCards.append(createSongCard(song)));
    }

    dom.songList.replaceChildren(dom.songListHeading, songCards);
}

/**
 * 사이트 설정도 songs.json에서 관리하도록 문서 제목과 화면 제목을 동기화합니다.
 * @param {{ title: string }} site
 */
function renderSiteData(site) {
    document.title = site.title;
    dom.siteTitle.textContent = site.title;
}

/**
 * 데이터 로딩 실패를 사용자가 확인할 수 있는 메시지로 표시합니다.
 * @param {unknown} error
 */
export function renderLoadError(error) {
    const message = error instanceof Error
        ? `곡 목록을 불러오지 못했습니다. ${error.message}`
        : "곡 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.";

    dom.introPanel.replaceChildren(dom.introHeading);
    dom.songList.replaceChildren(dom.songListHeading, createErrorMessage(message));
}
