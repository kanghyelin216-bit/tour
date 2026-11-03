const form = document.getElementById("guestbook-form");
const nameInput = document.getElementById("name");
const messageInput = document.getElementById("message");
const submitButton = document.getElementById("submit-button");
const formStatus = document.getElementById("form-status");
const listStatus = document.getElementById("list-status");
const entriesElement = document.getElementById("entries");
const refreshButton = document.getElementById("refresh-button");
const charCount = document.getElementById("char-count");

const MAX_MESSAGE_LENGTH = 300;
const POLL_INTERVAL_MS = 15000;

function getClientId() {
  const key = "myGuestbookClientId";
  let id = localStorage.getItem(key);

  if (!id) {
    id = (crypto.randomUUID
      ? crypto.randomUUID()
      : "xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx".replace(/[xy]/g, c => {
          const r = Math.random() * 16 | 0;
          return (c === "x" ? r : (r & 0x3 | 0x8)).toString(16);
        })).replace(/-/g, "");

    localStorage.setItem(key, id);
  }
  return id;
}

function jsonpRequest(params) {
  return new Promise((resolve, reject) => {
    if (!GAS_WEB_APP_URL || GAS_WEB_APP_URL.includes("여기에_")) {
      reject(new Error("config.js에 GAS 웹 앱 URL을 먼저 입력해 주세요."));
      return;
    }

    const callbackName = "guestbook_cb_" + Date.now() + "_" +
      Math.random().toString(36).slice(2);

    const script = document.createElement("script");
    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error("서버 응답 시간이 초과되었습니다. 잠시 후 다시 시도해 주세요."));
    }, 15000);

    function cleanup() {
      clearTimeout(timeout);
      delete window[callbackName];
      script.remove();
    }

    window[callbackName] = data => {
      cleanup();
      resolve(data);
    };

    script.onerror = () => {
      cleanup();
      reject(new Error("서버에 연결할 수 없습니다. GAS 배포 URL과 배포 권한을 확인해 주세요."));
    };

    const query = new URLSearchParams({
      ...params,
      callback: callbackName,
      _: Date.now().toString()
    });

    script.src = GAS_WEB_APP_URL + "?" + query.toString();
    document.body.appendChild(script);
  });
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function renderEntries(entries) {
  entriesElement.replaceChildren();

  if (!entries || entries.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "아직 작성된 방명록이 없습니다. 첫 번째 메시지를 남겨 보세요!";
    entriesElement.appendChild(empty);
    return;
  }

  entries.forEach(entry => {
    const article = document.createElement("article");
    article.className = "entry";

    const top = document.createElement("div");
    top.className = "entry-top";

    const author = document.createElement("strong");
    author.className = "entry-author";
    author.textContent = entry.name;

    const date = document.createElement("time");
    date.className = "entry-date";
    date.textContent = formatDate(entry.createdAt);
    if (entry.createdAt) date.dateTime = entry.createdAt;

    const message = document.createElement("p");
    message.className = "entry-message";
    message.textContent = entry.message;

    top.append(author, date);
    article.append(top, message);
    entriesElement.appendChild(article);
  });
}

async function loadEntries(showLoading = true) {
  if (showLoading) listStatus.textContent = "방명록을 불러오는 중입니다.";

  try {
    const result = await jsonpRequest({ action: "list" });
    if (!result.ok) throw new Error(result.error || "목록을 불러오지 못했습니다.");

    renderEntries(result.entries);
    listStatus.textContent = `총 ${result.entries.length}개의 메시지`;
  } catch (error) {
    listStatus.textContent = error.message;
  }
}

messageInput.addEventListener("input", () => {
  charCount.textContent = `${messageInput.value.length} / ${MAX_MESSAGE_LENGTH}`;
});

form.addEventListener("submit", async event => {
  event.preventDefault();

  const name = nameInput.value.trim();
  const message = messageInput.value.trim();

  if (!name || !message) {
    formStatus.textContent = "이름과 메시지를 모두 입력해 주세요.";
    return;
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    formStatus.textContent = "메시지는 300자 이하로 작성해 주세요.";
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = "등록 중...";
  formStatus.textContent = "";

  try {
    const result = await jsonpRequest({
      action: "add",
      name,
      message,
      clientId: getClientId()
    });

    if (!result.ok) throw new Error(result.error || "등록에 실패했습니다.");

    form.reset();
    charCount.textContent = "0 / 300";
    formStatus.textContent = result.message;
    await loadEntries(false);
  } catch (error) {
    formStatus.textContent = error.message;
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = '방명록 등록하기 <span>→</span>';
  }
});

refreshButton.addEventListener("click", () => loadEntries());

loadEntries();

// 15초마다 목록을 다시 조회합니다. 변경 사항은 다음 조회 때 표시됩니다.
setInterval(() => loadEntries(false), POLL_INTERVAL_MS);
