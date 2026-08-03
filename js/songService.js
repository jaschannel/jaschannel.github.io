const SONGS_DATA_URL = new URL("../songs.json", import.meta.url);

/**
 * songs.json을 읽거나 검증하는 과정에서 발생하는 오류입니다.
 */
export class SongDataError extends Error {
    constructor(message, cause) {
        super(message, cause ? { cause } : undefined);
        this.name = "SongDataError";
    }
}

/**
 * GitHub Pages에서 제공되는 songs.json을 가져와 검증합니다.
 *
 * @param {string | URL} dataUrl - 테스트나 향후 데이터 이전 시 사용할 JSON 위치
 * @returns {Promise<{ site: Site, songs: Song[] }>}
 */
export async function loadSongLibrary(dataUrl = SONGS_DATA_URL) {
    const response = await requestSongData(dataUrl);
    const data = await parseJson(response);

    return validateLibraryData(data);
}

/**
 * @param {string | URL} dataUrl
 * @returns {Promise<Response>}
 */
async function requestSongData(dataUrl) {
    try {
        const response = await fetch(dataUrl, {
            headers: {
                Accept: "application/json"
            }
        });

        if (!response.ok) {
            throw new SongDataError(`곡 데이터를 불러오지 못했습니다. (HTTP ${response.status})`);
        }

        return response;
    } catch (error) {
        if (error instanceof SongDataError) {
            throw error;
        }

        throw new SongDataError("곡 데이터 요청 중 네트워크 오류가 발생했습니다.", error);
    }
}

/**
 * @param {Response} response
 * @returns {Promise<unknown>}
 */
async function parseJson(response) {
    try {
        return await response.json();
    } catch (error) {
        throw new SongDataError("songs.json 형식이 올바른 JSON이 아닙니다.", error);
    }
}

/**
 * UI가 의존하는 데이터 형태를 한 곳에서 검증합니다.
 * @param {unknown} data
 * @returns {{ site: Site, songs: Song[] }}
 */
function validateLibraryData(data) {
    if (!isRecord(data)) {
        throw new SongDataError("songs.json의 최상위 값은 객체여야 합니다.");
    }

    const site = validateSite(data.site);

    if (!Array.isArray(data.songs)) {
        throw new SongDataError("songs.json의 songs는 배열이어야 합니다.");
    }

    const songs = data.songs.map(validateSong);
    assertUniqueSongIds(songs);

    return { site, songs };
}

/**
 * @param {unknown} site
 * @returns {Site}
 */
function validateSite(site) {
    if (!isRecord(site)) {
        throw new SongDataError("site 정보가 필요합니다.");
    }

    return {
        title: readRequiredText(site, "title", "site"),
        author: validateAuthor(site.author)
    };
}

/**
 * @param {unknown} author
 * @returns {{ name: string, intro: string }}
 */
function validateAuthor(author) {
    if (!isRecord(author)) {
        throw new SongDataError("site.author 정보가 필요합니다.");
    }

    return {
        name: readRequiredText(author, "name", "site.author"),
        intro: readText(author, "intro", "site.author")
    };
}

/**
 * @param {unknown} song
 * @param {number} index
 * @returns {Song}
 */
function validateSong(song, index) {
    const location = `songs[${index}]`;

    if (!isRecord(song)) {
        throw new SongDataError(`${location}은 객체여야 합니다.`);
    }

    return {
        id: readRequiredText(song, "id", location),
        title: readRequiredText(song, "title", location),
        lyricist: readRequiredText(song, "lyricist", location),
        composer: readRequiredText(song, "composer", location),
        lyrics: readText(song, "lyrics", location),
        story: readText(song, "story", location),
        youtubeUrl: readYoutubeUrl(song.youtubeUrl, location)
    };
}

/**
 * @param {Record<string, unknown>} record
 * @param {string} key
 * @param {string} location
 * @returns {string}
 */
function readRequiredText(record, key, location) {
    const value = readText(record, key, location);

    if (!value.trim()) {
        throw new SongDataError(`${location}.${key}은 비어 있을 수 없습니다.`);
    }

    return value;
}

/**
 * @param {Record<string, unknown>} record
 * @param {string} key
 * @param {string} location
 * @returns {string}
 */
function readText(record, key, location) {
    const value = record[key];

    if (typeof value !== "string") {
        throw new SongDataError(`${location}.${key}은 문자열이어야 합니다.`);
    }

    return value;
}

/**
 * @param {unknown} value
 * @param {string} location
 * @returns {string | null}
 */
function readYoutubeUrl(value, location) {
    if (value === null) {
        return null;
    }

    if (typeof value !== "string") {
        throw new SongDataError(`${location}.youtubeUrl은 URL 문자열 또는 null이어야 합니다.`);
    }

    try {
        const url = new URL(value);

        if (url.protocol !== "https:") {
            throw new Error("HTTPS가 아님");
        }

        return url.href;
    } catch (error) {
        throw new SongDataError(`${location}.youtubeUrl은 유효한 HTTPS URL이어야 합니다.`, error);
    }
}

/**
 * @param {Song[]} songs
 */
function assertUniqueSongIds(songs) {
    const songIds = new Set();

    for (const song of songs) {
        if (songIds.has(song.id)) {
            throw new SongDataError(`중복된 곡 id가 있습니다: ${song.id}`);
        }

        songIds.add(song.id);
    }
}

/**
 * @param {unknown} value
 * @returns {value is Record<string, unknown>}
 */
function isRecord(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * @typedef {Object} Song
 * @property {string} id
 * @property {string} title
 * @property {string} lyricist
 * @property {string} composer
 * @property {string} lyrics
 * @property {string} story
 * @property {string | null} youtubeUrl
 */

/**
 * @typedef {Object} Site
 * @property {string} title
 * @property {{ name: string, intro: string }} author
 */
