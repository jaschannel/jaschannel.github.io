/**
 * 반복 조회를 피하기 위해 페이지 진입 시 필요한 DOM을 한 번만 캐싱합니다.
 */
export const dom = Object.freeze({
    siteMain: getRequiredElement(".site-main"),
    siteTitle: getRequiredElement(".site-title"),
    introPanel: getRequiredElement(".intro-panel"),
    introHeading: getRequiredElement("#intro-heading"),
    songList: getRequiredElement(".song-list"),
    songListHeading: getRequiredElement("#song-list-heading"),
    introTemplate: getRequiredElement("#intro-template"),
    songTemplate: getRequiredElement("#song-template"),
    emptyStateTemplate: getRequiredElement("#empty-state-template")
});

/**
 * 필수 UI가 누락된 경우 조기에 명확한 오류를 발생시킵니다.
 * @param {string} selector
 * @returns {Element}
 */
function getRequiredElement(selector) {
    const element = document.querySelector(selector);

    if (!element) {
        throw new Error(`필수 DOM 요소를 찾을 수 없습니다: ${selector}`);
    }

    return element;
}
