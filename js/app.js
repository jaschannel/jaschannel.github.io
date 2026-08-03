import { renderLibrary, renderLoadError } from "./renderer.js";
import { dom } from "./dom.js";
import { initializeInteractions, initializeScrollAnimations } from "./ui.js";

/**
 * 앱 진입점에서 렌더링 흐름을 시작합니다.
 */
async function initializeApp() {
    document.documentElement.dataset.libraryState = "loading";
    dom.songList.setAttribute("aria-busy", "true");

    try {
        await renderLibrary();
        initializeInteractions();
        initializeScrollAnimations();
        document.documentElement.dataset.libraryState = "ready";
    } catch (error) {
        document.documentElement.dataset.libraryState = "error";
        renderLoadError(error);
        console.error("자작곡 데이터를 초기화하지 못했습니다.", error);
    } finally {
        dom.songList.setAttribute("aria-busy", "false");
    }
}

void initializeApp();
