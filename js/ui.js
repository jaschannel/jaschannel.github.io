import { dom } from "./dom.js";

const DISCLOSURE_TOGGLE_SELECTOR = ".js-toggle, .js-story-toggle";
const STORY_TOGGLE_SELECTOR = ".js-story-toggle";
const EXPANDED_STATE = "true";
const DISCLOSURE_MIN_DURATION = 200;
const DISCLOSURE_MAX_DURATION = 380;
const DISCLOSURE_PIXELS_PER_MILLISECOND = 4;
const DISCLOSURE_EASING = "cubic-bezier(0.22, 1, 0.36, 1)";
const SCROLL_OBSERVER_OPTIONS = Object.freeze({
    root: null,
    rootMargin: "0px 0px -6% 0px",
    threshold: 0.12
});

let isInteractionInitialized = false;
let nextDisclosureId = 1;
let scrollObserver = null;

/**
 * 하나의 이벤트 위임 리스너로 모든 현재·미래 카드의 펼침 동작을 처리합니다.
 */
export function initializeInteractions() {
    synchronizeDisclosureAttributes();

    if (isInteractionInitialized) {
        return;
    }

    dom.siteMain.addEventListener("click", handleMainClick, { passive: true });
    isInteractionInitialized = true;
}

/**
 * 카드가 화면에 들어올 때만 fade 효과를 적용합니다.
 * 새 렌더링 이후 다시 호출해도 이전 관찰자를 정리합니다.
 */
export function initializeScrollAnimations() {
    const cards = dom.siteMain.querySelectorAll(".fade");

    scrollObserver?.disconnect();

    if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
        cards.forEach((card) => card.classList.add("is-visible"));
        return;
    }

    scrollObserver = new IntersectionObserver(handleIntersection, SCROLL_OBSERVER_OPTIONS);

    cards.forEach((card) => scrollObserver.observe(card));
}

/**
 * @param {MouseEvent} event
 */
function handleMainClick(event) {
    if (!(event.target instanceof Element)) {
        return;
    }

    const toggle = event.target.closest(DISCLOSURE_TOGGLE_SELECTOR);

    if (!(toggle instanceof HTMLButtonElement) || !dom.siteMain.contains(toggle)) {
        return;
    }

    const panel = getDisclosurePanel(toggle);

    if (!panel) {
        return;
    }

    const isExpanded = isDisclosureExpanded(toggle);
    setDisclosureState(toggle, panel, !isExpanded, true);

    if (isExpanded && toggle.classList.contains("js-toggle")) {
        collapseNestedStory(panel);
    }
}

/**
 * 새로 렌더링된 요소에도 일관된 ARIA 관계와 초기 상태를 설정합니다.
 */
function synchronizeDisclosureAttributes() {
    const toggles = dom.siteMain.querySelectorAll(DISCLOSURE_TOGGLE_SELECTOR);

    toggles.forEach((toggle) => {
        if (!(toggle instanceof HTMLButtonElement)) {
            return;
        }

        const panel = getDisclosurePanel(toggle);

        if (!panel) {
            return;
        }

        if (!panel.id) {
            panel.id = createDisclosureId(toggle);
        }

        toggle.setAttribute("aria-controls", panel.id);
        setDisclosureState(toggle, panel, isDisclosureExpanded(toggle));
    });
}

/**
 * @param {HTMLButtonElement} toggle
 * @returns {HTMLElement | null}
 */
function getDisclosurePanel(toggle) {
    if (toggle.classList.contains("js-story-toggle")) {
        const story = toggle.nextElementSibling;

        return story instanceof HTMLElement && story.classList.contains("story")
            ? story
            : null;
    }

    const card = toggle.closest(".song-card");

    if (!(card instanceof HTMLElement)) {
        return null;
    }

    return Array.from(card.children).find((child) => child.classList.contains("panel-body")) ?? null;
}

/**
 * @param {HTMLButtonElement} toggle
 * @returns {string}
 */
function createDisclosureId(toggle) {
    const prefix = toggle.classList.contains("js-story-toggle")
        ? "story-panel"
        : "song-panel";

    const id = `${prefix}-${nextDisclosureId}`;

    nextDisclosureId += 1;

    return id;
}

/**
 * @param {HTMLButtonElement} toggle
 * @param {HTMLElement} panel
 * @param {boolean} isExpanded
 * @param {boolean} shouldAnimate
 */
function setDisclosureState(toggle, panel, isExpanded, shouldAnimate = false) {
    toggle.setAttribute("aria-expanded", String(isExpanded));
    panel.setAttribute("aria-hidden", String(!isExpanded));

    if (!shouldAnimate || prefersReducedMotion() || typeof panel.animate !== "function") {
        stopPanelAnimations(panel);
        clearPanelAnimationStyles(panel);
        panel.hidden = !isExpanded;
        return;
    }

    animateDisclosure(panel, isExpanded);
}

/**
 * 곡 카드를 닫을 때 내부 제작 배경도 함께 닫아 상태를 예측 가능하게 만듭니다.
 * @param {HTMLElement} songPanel
 */
function collapseNestedStory(songPanel) {
    const storyToggle = songPanel.querySelector(STORY_TOGGLE_SELECTOR);

    if (!(storyToggle instanceof HTMLButtonElement)) {
        return;
    }

    const storyPanel = getDisclosurePanel(storyToggle);

    if (storyPanel) {
        setDisclosureState(storyToggle, storyPanel, false, true);
    }
}

/**
 * @param {IntersectionObserverEntry[]} entries
 */
function handleIntersection(entries) {
    entries.forEach((entry) => {
        if (!entry.isIntersecting) {
            return;
        }

        entry.target.classList.add("is-visible");
        scrollObserver?.unobserve(entry.target);
    });
}

/**
 * hidden 속성과 충돌하지 않도록 Web Animations API로 패널 높이를 전환합니다.
 * @param {HTMLElement} panel
 * @param {boolean} isExpanded
 */
function animateDisclosure(panel, isExpanded) {
    stopPanelAnimations(panel);
    panel.hidden = false;

    const startHeight = isExpanded ? 0 : panel.getBoundingClientRect().height;
    const endHeight = isExpanded ? panel.scrollHeight : 0;

    if (startHeight === endHeight) {
        clearPanelAnimationStyles(panel);
        panel.hidden = !isExpanded;
        return;
    }

    panel.style.height = `${startHeight}px`;
    panel.style.overflow = "hidden";
    panel.style.willChange = "height, opacity";

    const animation = panel.animate([
        { height: `${startHeight}px`, opacity: isExpanded ? 0 : 1 },
        { height: `${endHeight}px`, opacity: isExpanded ? 1 : 0 }
    ], {
        duration: getDisclosureDuration(Math.abs(endHeight - startHeight)),
        easing: DISCLOSURE_EASING,
        fill: "both"
    });

    animation.onfinish = () => {
        clearPanelAnimationStyles(panel);
        panel.hidden = !isExpanded;
    };
}

/**
 * @param {HTMLElement} panel
 */
function stopPanelAnimations(panel) {
    if (typeof panel.getAnimations === "function") {
        panel.getAnimations().forEach((animation) => animation.cancel());
    }
}

/**
 * @param {HTMLElement} panel
 */
function clearPanelAnimationStyles(panel) {
    panel.style.height = "";
    panel.style.overflow = "";
    panel.style.willChange = "";
}

/**
 * 긴 가사 패널도 너무 빠르거나 느리지 않게 높이에 비례한 시간을 계산합니다.
 * @param {number} heightDifference
 * @returns {number}
 */
function getDisclosureDuration(heightDifference) {
    const duration = heightDifference / DISCLOSURE_PIXELS_PER_MILLISECOND;

    return Math.min(DISCLOSURE_MAX_DURATION, Math.max(DISCLOSURE_MIN_DURATION, duration));
}

/**
 * @param {HTMLButtonElement} toggle
 * @returns {boolean}
 */
function isDisclosureExpanded(toggle) {
    return toggle.getAttribute("aria-expanded") === EXPANDED_STATE;
}

/**
 * @returns {boolean}
 */
function prefersReducedMotion() {
    const mediaQuery = window.matchMedia?.("(prefers-reduced-motion: reduce)");

    return mediaQuery?.matches ?? false;
}
