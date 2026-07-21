(function () {
    "use strict";

    const STORAGE_KEY = "theShelf.books";
    const SPINE_COLORS = ["#5a3d3d", "#3d4f4a", "#4a3d5a", "#7a5c2e", "#2e4a5c", "#5c3d2e", "#3d5a4f", "#5a2e3d"];

    let books = [];
    let editingId = null;
    let currentRating = 0;
    let pendingCoverData = "";

    const shelfGrid = document.getElementById("shelfGrid");
    const emptyState = document.getElementById("emptyState");
    const searchInput = document.getElementById("searchInput");
    const sortSelect = document.getElementById("sortSelect");

    function uid() {
        return "b" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    }

    function hashCode(str) {
        let h = 0;
        for (let i = 0; i < str.length; i++) {
            h = (h * 31 + str.charCodeAt(i)) >>> 0;
        }
        return h;
    }

    function hashColor(str) {
        return SPINE_COLORS[hashCode(str) % SPINE_COLORS.length];
    }

    function escapeHtml(str) {
        const d = document.createElement("div");
        d.textContent = str || "";
        return d.innerHTML;
    }

    function loadBooks() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            books = raw ? JSON.parse(raw) : [];
        } catch (e) {
            console.error("Could not read your library:", e);
            books = [];
        }
        render();
    }

    function saveBooks() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
        } catch (e) {
            console.error("Could not save your library:", e);
            alert("Your shelf could not be saved just now. Your browser storage may be full.");
        }
    }

    function getFiltered() {
        const q = (searchInput.value || "").trim().toLowerCase();
        let list = books.filter(
            (b) => !q || b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)
        );
        const sortMode = sortSelect.value;
        if (sortMode === "title") list.sort((a, b) => a.title.localeCompare(b.title));
        else if (sortMode === "author") list.sort((a, b) => a.author.localeCompare(b.author));
        else if (sortMode === "rating") list.sort((a, b) => b.rating - a.rating);
        else list.sort((a, b) => b.dateAdded - a.dateAdded);
        return list;
    }

    function render() {
        const list = getFiltered();
        shelfGrid.innerHTML = "";
        emptyState.style.display = books.length === 0 ? "block" : "none";

        if (books.length > 0 && list.length === 0) {
            const msg = document.createElement("div");
            msg.className = "empty-state";
            msg.style.gridColumn = "1/-1";
            msg.innerHTML = '<span class="big">No matches.</span>Try a different title or author.';
            shelfGrid.appendChild(msg);
            return;
        }

        list.forEach((b) => {
            const el = document.createElement("div");
            el.className = "book";
            el.style.setProperty("--tilt", (hashCode(b.id) % 5) - 2 + "deg");
            el.setAttribute("tabindex", "0");
            el.setAttribute("role", "button");
            el.setAttribute("aria-label", b.title + " by " + b.author);

            if (b.cover) {
                const img = document.createElement("img");
                img.src = b.cover;
                img.alt = b.title + " cover";
                el.appendChild(img);
            } else {
                const fb = document.createElement("div");
                fb.className = "spine-fallback";
                fb.style.background = hashColor(b.title + b.author);
                fb.innerHTML =
                    '<div class="t">' + escapeHtml(b.title) + '</div><div class="a">' + escapeHtml(b.author) + "</div>";
                el.appendChild(fb);
            }

            if (b.rating > 0) {
                const stars = document.createElement("div");
                stars.className = "stars-mini";
                stars.textContent = "★".repeat(b.rating);
                el.appendChild(stars);
            }

            el.addEventListener("click", () => openDetail(b.id));
            el.addEventListener("keydown", (e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openDetail(b.id);
                }
            });
            shelfGrid.appendChild(el);
        });
    }

    // ---------- Detail modal ----------
    const detailOverlay = document.getElementById("detailOverlay");
    const detailContent = document.getElementById("detailContent");
    document.getElementById("detailClose").addEventListener("click", () => detailOverlay.classList.remove("open"));
    detailOverlay.addEventListener("click", (e) => {
        if (e.target === detailOverlay) detailOverlay.classList.remove("open");
    });

    function renderStarsDisplay(rating) {
        let out = "";
        for (let i = 1; i <= 5; i++) {
            out += i <= rating ? "★" : '<span class="off">★</span>';
        }
        return out;
    }

    function openDetail(id) {
        const b = books.find((x) => x.id === id);
        if (!b) return;
        const dateStr = new Date(b.dateAdded).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
        const starsHtml = renderStarsDisplay(b.rating);

        let coverHtml;
        if (b.cover) {
            coverHtml =
                '<img class="detail-cover" src="' + escapeHtml(b.cover) + '" alt="' + escapeHtml(b.title) + ' cover">';
        } else {
            coverHtml =
                '<div class="detail-cover fallback" style="background:' +
                hashColor(b.title + b.author) +
                '"><span style="color:rgba(255,255,255,0.9);font-weight:600;font-size:0.85rem;">' +
                escapeHtml(b.title) +
                "</span></div>";
        }

        detailContent.innerHTML =
            '<div class="stamp">READ<br>' +
            dateStr +
            '</div><div class="detail-top">' +
            coverHtml +
            '<div><h3 class="detail-title">' +
            escapeHtml(b.title) +
            '</h3><p class="detail-author">' +
            escapeHtml(b.author) +
            '</p><div class="stars-row">' +
            starsHtml +
            "</div></div></div>" +
            (b.review
                ? '<span class="review-label">Review</span><div class="review-block">' + escapeHtml(b.review) + "</div>"
                : "") +
            '<div class="detail-actions"><button class="btn-secondary" id="editBookBtn">Edit</button>' +
            '<button class="btn-danger" id="deleteBookBtn">Remove</button></div>';

        document.getElementById("editBookBtn").addEventListener("click", () => {
            detailOverlay.classList.remove("open");
            openForm(b.id);
        });
        document.getElementById("deleteBookBtn").addEventListener("click", () => {
            if (confirm('Remove "' + b.title + '" from your shelf? This cannot be undone.')) {
                books = books.filter((x) => x.id !== b.id);
                saveBooks();
                render();
                detailOverlay.classList.remove("open");
            }
        });

        detailOverlay.classList.add("open");
    }

    // ---------- Add / Edit form ----------
    const formOverlay = document.getElementById("formOverlay");
    const bookForm = document.getElementById("bookForm");
    const formTitle = document.getElementById("formTitle");
    const formTab = document.getElementById("formTab");
    const titleInput = document.getElementById("titleInput");
    const authorInput = document.getElementById("authorInput");
    const coverUrlInput = document.getElementById("coverUrlInput");
    const reviewInput = document.getElementById("reviewInput");
    const starPicker = document.getElementById("starPicker");
    const coverPreviewWrap = document.getElementById("coverPreviewWrap");
    const coverPreview = document.getElementById("coverPreview");
    const formError = document.getElementById("formError");

    document.getElementById("openAddBtn").addEventListener("click", () => openForm(null));
    document.getElementById("formClose").addEventListener("click", closeForm);
    document.getElementById("cancelFormBtn").addEventListener("click", closeForm);
    formOverlay.addEventListener("click", (e) => {
        if (e.target === formOverlay) closeForm();
    });

    function closeForm() {
        formOverlay.classList.remove("open");
        bookForm.reset();
        pendingCoverData = "";
        coverPreviewWrap.style.display = "none";
        formError.style.display = "none";
        setStars(0);
        editingId = null;
    }

    function openForm(id) {
        editingId = id;
        formError.style.display = "none";
        if (id) {
            const b = books.find((x) => x.id === id);
            formTitle.textContent = "Edit entry";
            formTab.textContent = "REVISED ENTRY";
            titleInput.value = b.title;
            authorInput.value = b.author;
            coverUrlInput.value = b.cover && !b.cover.startsWith("data:") ? b.cover : "";
            pendingCoverData = b.cover && b.cover.startsWith("data:") ? b.cover : "";
            reviewInput.value = b.review || "";
            setStars(b.rating || 0);
            if (b.cover) {
                coverPreview.src = b.cover;
                coverPreviewWrap.style.display = "block";
            } else {
                coverPreviewWrap.style.display = "none";
            }
        } else {
            formTitle.textContent = "Add a book";
            formTab.textContent = "NEW ENTRY";
            bookForm.reset();
            pendingCoverData = "";
            coverPreviewWrap.style.display = "none";
            setStars(0);
        }
        formOverlay.classList.add("open");
        setTimeout(() => titleInput.focus(), 50);
    }

    function setStars(n) {
        currentRating = n;
        [...starPicker.children].forEach((s) => {
            s.classList.toggle("on", Number(s.dataset.v) <= n);
        });
    }
    starPicker.addEventListener("click", (e) => {
        if (e.target.dataset.v) setStars(Number(e.target.dataset.v));
    });

    coverUrlInput.addEventListener("input", () => {
        if (coverUrlInput.value.trim()) {
            pendingCoverData = "";
            coverPreview.src = coverUrlInput.value.trim();
            coverPreviewWrap.style.display = "block";
        }
    });

    document.getElementById("uploadBtn").addEventListener("click", () => {
        document.getElementById("coverFileInput").click();
    });

    document.getElementById("coverFileInput").addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function (ev) {
            const img = new Image();
            img.onload = function () {
                const maxW = 300;
                const scale = Math.min(1, maxW / img.width);
                const canvas = document.createElement("canvas");
                canvas.width = img.width * scale;
                canvas.height = img.height * scale;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                pendingCoverData = canvas.toDataURL("image/jpeg", 0.82);
                coverUrlInput.value = "";
                coverPreview.src = pendingCoverData;
                coverPreviewWrap.style.display = "block";
            };
            img.src = ev.target.result;
        };
        reader.onerror = function () {
            formError.textContent = "Couldn't read that image. Try a different file.";
            formError.style.display = "block";
        };
        reader.readAsDataURL(file);
    });

    bookForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const title = titleInput.value.trim();
        const author = authorInput.value.trim();
        if (!title || !author) {
            formError.textContent = "Title and author are both required.";
            formError.style.display = "block";
            return;
        }
        const cover = pendingCoverData || coverUrlInput.value.trim();

        if (editingId) {
            const b = books.find((x) => x.id === editingId);
            b.title = title;
            b.author = author;
            b.cover = cover;
            b.rating = currentRating;
            b.review = reviewInput.value.trim();
        } else {
            books.push({
                id: uid(),
                title,
                author,
                cover,
                rating: currentRating,
                review: reviewInput.value.trim(),
                dateAdded: Date.now(),
            });
        }
        saveBooks();
        render();
        closeForm();
    });

    searchInput.addEventListener("input", render);
    sortSelect.addEventListener("change", render);

    loadBooks();
})();