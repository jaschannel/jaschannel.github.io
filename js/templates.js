import { dom } from "./dom.js";

let nextSongTitleId = 1;

/**
 * 제작자 소개 템플릿에 데이터를 채웁니다.
 * @param {{ name: string, intro: string }} author
 * @returns {HTMLElement}
 */
export function createIntroCard(author) {
    const card = cloneTemplate(dom.introTemplate);
    const introText = author.intro || `${author.name}의 자작곡을 소개합니다.`;

    getRequiredChild(card, ".js-intro-text").textContent = introText;

    return card;
}

/**
 * 곡 템플릿에 songs.json의 한 곡 데이터를 채웁니다.
 * @param {{ id: string, title: string, lyricist: string, composer: string, lyrics: string, story: string, youtubeUrl: string | null }} song
 * @returns {HTMLElement}
 */
export function createSongCard(song) {
    const card = cloneTemplate(dom.songTemplate);
    const title = getRequiredChild(card, ".js-title");

    card.dataset.songId = song.id;
    title.id = `song-title-${nextSongTitleId}`;
    card.setAttribute("aria-labelledby", title.id);
    nextSongTitleId += 1;
    title.textContent = song.title;
    getRequiredChild(card, ".js-lyricist").textContent = song.lyricist;
    getRequiredChild(card, ".js-composer").textContent = song.composer;
    getRequiredChild(card, ".js-lyrics").textContent = song.lyrics || "가사를 준비 중입니다.";
    getRequiredChild(card, ".js-story").textContent = song.story || "제작 배경을 준비 중입니다.";

    setYoutubeLink(card, song.youtubeUrl);

    return card;
}

/**
 * @returns {HTMLElement}
 */
export function createEmptyState() {
    return cloneTemplate(dom.emptyStateTemplate);
}

/**
 * @param {string} message
 * @returns {HTMLParagraphElement}
 */
export function createErrorMessage(message) {
    const errorMessage = document.createElement("p");

    errorMessage.className = "library-message";
    errorMessage.setAttribute("role", "alert");
    errorMessage.textContent = message;

    return errorMessage;
}

/**
 * @param {Element} template
 * @returns {HTMLElement}
 */
function cloneTemplate(template) {
    if (!(template instanceof HTMLTemplateElement)) {
        throw new Error("템플릿 요소가 올바르지 않습니다.");
    }

    const element = template.content.firstElementChild?.cloneNode(true);

    if (!(element instanceof HTMLElement)) {
        throw new Error("템플릿의 최상위 HTML 요소가 필요합니다.");
    }

    return element;
}

/**
 * @param {HTMLElement} parent
 * @param {string} selector
 * @returns {HTMLElement}
 */
function getRequiredChild(parent, selector) {
    const element = parent.querySelector(selector);

    if (!(element instanceof HTMLElement)) {
        throw new Error(`템플릿 내부 요소를 찾을 수 없습니다: ${selector}`);
    }

    return element;
}

/**
 * @param {HTMLElement} card
 * @param {string | null} youtubeUrl
 */
function setYoutubeLink(card, youtubeUrl) {
    const link = getRequiredChild(card, ".js-youtube");

    if (!(link instanceof HTMLAnchorElement)) {
        throw new Error("YouTube 링크 요소가 올바르지 않습니다.");
    }

    if (!youtubeUrl) {
        link.hidden = true;
        return;
    }

    link.href = youtubeUrl;
}
