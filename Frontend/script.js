(function () {
    "use strict";

    //Configuration
    //Express backend will use this URL.
    const API_URL = "http://localhost:3000/api/books";

    const SPINE_COLORS = [
        "#5a3d3d",
        "#3d4f4a",
        "#4a3d5a",
        "#7a5c2e",
        "#2e4a5c",
        "#5c3d2e",
        "#3d5a4f",
        "#5a2e3d"
    ];


    //Application State
    let books = [];
    let editingId = null;
    let currentRating = 0;
    let pendingCoverData = "";


    //DOM Elements
    const shelfGrid = document.getElementById("shelfGrid");
    const emptyState = document.getElementById("emptyState");
    const searchInput = document.getElementById("searchInput");
    const sortSelect = document.getElementById("sortSelect");

    // Detail modal
    const detailOverlay = document.getElementById("detailOverlay");
    const detailContent = document.getElementById("detailContent");

    // Form modal
    const formOverlay = document.getElementById("formOverlay");
    const bookForm = document.getElementById("bookForm");
    const formTitle = document.getElementById("formTitle");
    const formTab = document.getElementById("formTab");

    const titleInput = document.getElementById("titleInput");
    const authorInput = document.getElementById("authorInput");
    const coverUrlInput = document.getElementById("coverUrlInput");
    const reviewInput = document.getElementById("reviewInput");
    const starPicker = document.getElementById("starPicker");

    const coverPreviewWrap =
        document.getElementById("coverPreviewWrap");

    const coverPreview =
        document.getElementById("coverPreview");

    const formError =
        document.getElementById("formError");


    //API Backend Communication
    //Gets all books from MySQL through Express.
    async function getBooks() {

        try {

            const response = await fetch(API_URL);

            if (!response.ok) {
                throw new Error("Failed to load books.");
            }

            books = await response.json();

            render();

        } catch (error) {

            console.error("Could not load books:", error);

            showApiError(
                "Could not connect to the server. Make sure the backend is running."
            );
        }
    }


    //Create Book in Database through Express
    async function createBook(bookData) {

        try {

            const response = await fetch(API_URL, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(bookData)

            });

            if (!response.ok) {

                const errorData = await response.json().catch(() => null);

                throw new Error(
                    errorData?.message || "Failed to create book."
                );
            }

            const newBook = await response.json();

            // Add the newly created book to our local state.
            books.push(newBook);

            render();

            return newBook;

        } catch (error) {

            console.error("Could not create book:", error);

            throw error;
        }
    }

    //Update Book in Database through Express
    async function updateBook(id, bookData) {

        try {

            const response = await fetch(`${API_URL}/${id}`, {

                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(bookData)

            });

            if (!response.ok) {

                const errorData = await response.json().catch(() => null);

                throw new Error(
                    errorData?.message || "Failed to update book."
                );
            }

            const updatedBook = await response.json();

            // Replace the old book in our local state.
            const index = books.findIndex(
                (book) => book.id === id
            );

            if (index !== -1) {
                books[index] = updatedBook;
            }

            render();

            return updatedBook;

        } catch (error) {

            console.error("Could not update book:", error);

            throw error;
        }
    }


    //Delete Book from Database through Express
    async function deleteBook(id) {

        try {

            const response = await fetch(`${API_URL}/${id}`, {
                method: "DELETE"
            });

            if (!response.ok) {

                const errorData = await response.json().catch(() => null);

                throw new Error(
                    errorData?.message || "Failed to delete book."
                );
            }

            // Remove the book from our local state
            books = books.filter(
                (book) => book.id !== id
            );

            render();

        } catch (error) {

            console.error("Could not delete book:", error);

            throw error;
        }
    }


    //API Error Handling
    function showApiError(message) {

        console.error(message);

        // We don't put the error inside the book grid.
        // For now, show it in the console and alert.
        alert(message);
    }


    //Utility Functions
    function hashCode(str) {

        let h = 0;

        for (let i = 0; i < str.length; i++) {
            h = (h * 31 + str.charCodeAt(i)) >>> 0;
        }

        return h;
    }


    function hashColor(str) {

        return SPINE_COLORS[
            hashCode(str) % SPINE_COLORS.length
        ];
    }


    function escapeHtml(str) {

        const d = document.createElement("div");

        d.textContent = str || "";

        return d.innerHTML;
    }


    //Filtering and Sorting
    function getFiltered() {

        const q =
            (searchInput.value || "")
                .trim()
                .toLowerCase();

        let list = books.filter(
            (book) =>
                !q ||
                book.title.toLowerCase().includes(q) ||
                book.author.toLowerCase().includes(q)
        );


        const sortMode = sortSelect.value;


        if (sortMode === "title") {

            list.sort(
                (a, b) =>
                    a.title.localeCompare(b.title)
            );

        } else if (sortMode === "author") {

            list.sort(
                (a, b) =>
                    a.author.localeCompare(b.author)
            );

        } else if (sortMode === "rating") {

            list.sort(
                (a, b) =>
                    b.rating - a.rating
            );

        } else {

            list.sort(
                (a, b) =>
                    Number(b.dateAdded) -
                    Number(a.dateAdded)
            );
        }


        return list;
    }


    //Render Book Shelf
    function render() {

        const list = getFiltered();

        shelfGrid.innerHTML = "";

        emptyState.style.display =
            books.length === 0
                ? "block"
                : "none";


        // Books exist but search returned nothing.
        if (books.length > 0 && list.length === 0) {

            const msg = document.createElement("div");

            msg.className = "empty-state";

            msg.style.gridColumn = "1/-1";

            msg.innerHTML =
                '<span class="big">No matches.</span>' +
                "Try a different title or author.";

            shelfGrid.appendChild(msg);

            return;
        }


        // Display books
        list.forEach((book) => {

            const el = document.createElement("div");

            el.className = "book";

            el.style.setProperty(
                "--tilt",
                (hashCode(String(book.id)) % 5) - 2 + "deg"
            );

            el.setAttribute("tabindex", "0");

            el.setAttribute("role", "button");

            el.setAttribute(
                "aria-label",
                book.title + " by " + book.author
            );


            //Book Cover
            if (book.cover) {

                const img = document.createElement("img");

                img.src = book.cover;

                img.alt = book.title + " cover";

                el.appendChild(img);

            } else {

                const fb =
                    document.createElement("div");

                fb.className = "spine-fallback";

                fb.style.background =
                    hashColor(
                        book.title + book.author
                    );

                fb.innerHTML =
                    '<div class="t">' +
                    escapeHtml(book.title) +
                    "</div>" +

                    '<div class="a">' +
                    escapeHtml(book.author) +
                    "</div>";

                el.appendChild(fb);
            }


            //Ratings
            if (book.rating > 0) {

                const stars =
                    document.createElement("div");

                stars.className = "stars-mini";

                stars.textContent =
                    "★".repeat(book.rating);

                el.appendChild(stars);
            }


            //Book click
            el.addEventListener(
                "click",
                () => openDetail(book.id)
            );


            el.addEventListener(
                "keydown",
                (e) => {

                    if (
                        e.key === "Enter" ||
                        e.key === " "
                    ) {

                        e.preventDefault();

                        openDetail(book.id);
                    }
                }
            );


            shelfGrid.appendChild(el);
        });
    }


    //Detail Modal
    document
        .getElementById("detailClose")
        .addEventListener(
            "click",
            () => detailOverlay.classList.remove("open")
        );


    detailOverlay.addEventListener(
        "click",
        (e) => {

            if (e.target === detailOverlay) {
                detailOverlay.classList.remove("open");
            }
        }
    );


    function renderStarsDisplay(rating) {

        let out = "";

        for (let i = 1; i <= 5; i++) {

            out +=
                i <= rating
                    ? "★"
                    : '<span class="off">★</span>';
        }

        return out;
    }


    function openDetail(id) {

        const book =
            books.find(
                (item) => item.id === id
            );

        if (!book) return;


        const dateStr =
            new Date(
                Number(book.dateAdded)
            ).toLocaleDateString(
                undefined,
                {
                    month: "short",
                    day: "numeric",
                    year: "numeric"
                }
            );


        const starsHtml =
            renderStarsDisplay(book.rating);


        //Cover 
        let coverHtml;


        if (book.cover) {

            coverHtml =
                '<img class="detail-cover" src="' +
                escapeHtml(book.cover) +
                '" alt="' +
                escapeHtml(book.title) +
                ' cover">';

        } else {

            coverHtml =
                '<div class="detail-cover fallback" style="background:' +
                hashColor(
                    book.title + book.author
                ) +
                '">' +

                '<span style="color:rgba(255,255,255,0.9);font-weight:600;font-size:0.85rem;">' +

                escapeHtml(book.title) +

                "</span></div>";
        }


        //Detail Content
        detailContent.innerHTML =

            '<div class="stamp">READ<br>' +
            dateStr +
            "</div>" +

            '<div class="detail-top">' +

            coverHtml +

            "<div>" +

            '<h3 class="detail-title">' +
            escapeHtml(book.title) +
            "</h3>" +

            '<p class="detail-author">' +
            escapeHtml(book.author) +
            "</p>" +

            '<div class="stars-row">' +
            starsHtml +
            "</div>" +

            "</div>" +

            "</div>" +

            (
                book.review
                    ? '<span class="review-label">Review</span>' +
                    '<div class="review-block">' +
                    escapeHtml(book.review) +
                    "</div>"
                    : ""
            ) +

            '<div class="detail-actions">' +

            '<button class="btn-secondary" id="editBookBtn">' +
            "Edit" +
            "</button>" +

            '<button class="btn-danger" id="deleteBookBtn">' +
            "Remove" +
            "</button>" +

            "</div>";


        //Edit
        document
            .getElementById("editBookBtn")
            .addEventListener(
                "click",
                () => {

                    detailOverlay.classList.remove("open");

                    openForm(book.id);
                }
            );


        //Delete
        document
            .getElementById("deleteBookBtn")
            .addEventListener(
                "click",
                async () => {

                    const confirmed =
                        confirm(
                            'Remove "' +
                            book.title +
                            '" from your shelf? This cannot be undone.'
                        );


                    if (!confirmed) return;


                    try {

                        await deleteBook(book.id);

                        detailOverlay.classList.remove("open");

                    } catch (error) {

                        alert(
                            "Could not remove the book."
                        );
                    }
                }
            );


        detailOverlay.classList.add("open");
    }

    //Add or Edit Form
    document
        .getElementById("openAddBtn")
        .addEventListener(
            "click",
            () => openForm(null)
        );


    document
        .getElementById("formClose")
        .addEventListener(
            "click",
            closeForm
        );


    document
        .getElementById("cancelFormBtn")
        .addEventListener(
            "click",
            closeForm
        );


    formOverlay.addEventListener(
        "click",
        (e) => {

            if (e.target === formOverlay) {
                closeForm();
            }
        }
    );


    function closeForm() {

        formOverlay.classList.remove("open");

        bookForm.reset();

        pendingCoverData = "";

        coverPreviewWrap.style.display =
            "none";

        formError.style.display =
            "none";

        setStars(0);

        editingId = null;
    }


    function openForm(id) {

        editingId = id;

        formError.style.display =
            "none";


        //Edit Book 
        if (id) {

            const book =
                books.find(
                    (item) => item.id === id
                );


            if (!book) return;


            formTitle.textContent =
                "Edit entry";

            formTab.textContent =
                "REVISED ENTRY";


            titleInput.value =
                book.title;

            authorInput.value =
                book.author;


            coverUrlInput.value =
                book.cover &&
                    !book.cover.startsWith("data:")
                    ? book.cover
                    : "";


            pendingCoverData =
                book.cover &&
                    book.cover.startsWith("data:")
                    ? book.cover
                    : "";


            reviewInput.value =
                book.review || "";


            setStars(
                book.rating || 0
            );


            if (book.cover) {

                coverPreview.src =
                    book.cover;

                coverPreviewWrap.style.display =
                    "block";

            } else {

                coverPreviewWrap.style.display =
                    "none";
            }


            //New book entry
        } else {

            formTitle.textContent =
                "Add a book";

            formTab.textContent =
                "NEW ENTRY";

            bookForm.reset();

            pendingCoverData = "";

            coverPreviewWrap.style.display =
                "none";

            setStars(0);
        }


        formOverlay.classList.add("open");


        setTimeout(
            () => titleInput.focus(),
            50
        );
    }


    //Rating stars
    function setStars(n) {

        currentRating = n;


        [...starPicker.children].forEach(
            (star) => {

                star.classList.toggle(
                    "on",
                    Number(star.dataset.v) <= n
                );
            }
        );
    }


    starPicker.addEventListener(
        "click",
        (e) => {

            if (e.target.dataset.v) {

                setStars(
                    Number(e.target.dataset.v)
                );
            }
        }
    );

    //Cover URL input
    coverUrlInput.addEventListener(
        "input",
        () => {

            if (coverUrlInput.value.trim()) {

                pendingCoverData = "";

                coverPreview.src =
                    coverUrlInput.value.trim();

                coverPreviewWrap.style.display =
                    "block";
            }
        }
    );


    //Cover upload
    document
        .getElementById("uploadBtn")
        .addEventListener(
            "click",
            () => {

                document
                    .getElementById("coverFileInput")
                    .click();
            }
        );


    document
        .getElementById("coverFileInput")
        .addEventListener(
            "change",
            (e) => {

                const file =
                    e.target.files[0];

                if (!file) return;


                const reader =
                    new FileReader();


                reader.onload =
                    function (ev) {

                        const img =
                            new Image();


                        img.onload =
                            function () {

                                const maxW = 300;


                                const scale =
                                    Math.min(
                                        1,
                                        maxW / img.width
                                    );


                                const canvas =
                                    document.createElement(
                                        "canvas"
                                    );


                                canvas.width =
                                    img.width * scale;

                                canvas.height =
                                    img.height * scale;


                                const ctx =
                                    canvas.getContext(
                                        "2d"
                                    );


                                ctx.drawImage(
                                    img,
                                    0,
                                    0,
                                    canvas.width,
                                    canvas.height
                                );


                                pendingCoverData =
                                    canvas.toDataURL(
                                        "image/jpeg",
                                        0.82
                                    );


                                coverUrlInput.value =
                                    "";


                                coverPreview.src =
                                    pendingCoverData;


                                coverPreviewWrap.style.display =
                                    "block";
                            };


                        img.src =
                            ev.target.result;
                    };


                reader.onerror =
                    function () {

                        formError.textContent =
                            "Couldn't read that image. Try a different file.";

                        formError.style.display =
                            "block";
                    };


                reader.readAsDataURL(file);
            }
        );

    //Create or Update book
    bookForm.addEventListener(
        "submit",
        async (e) => {

            e.preventDefault();


            const title =
                titleInput.value.trim();

            const author =
                authorInput.value.trim();

            //Vakidation
            if (!title || !author) {

                formError.textContent =
                    "Title and author are both required.";

                formError.style.display =
                    "block";

                return;
            }


            const cover =
                pendingCoverData ||
                coverUrlInput.value.trim();


            const bookData = {

                title: title,

                author: author,

                cover: cover,

                rating: currentRating,

                review:
                    reviewInput.value.trim(),

                dateAdded:
                    Date.now()
            };


            //Update or Create
            if (editingId) {

                try {

                    await updateBook(
                        editingId,
                        bookData
                    );

                    closeForm();

                } catch (error) {

                    formError.textContent =
                        "Could not update the book. Please try again.";

                    formError.style.display =
                        "block";
                }

            } else {

                try {

                    await createBook(
                        bookData
                    );

                    closeForm();

                } catch (error) {

                    formError.textContent =
                        "Could not add the book. Please try again.";

                    formError.style.display =
                        "block";
                }
            }
        }
    );


    //Search and Sort
    searchInput.addEventListener(
        "input",
        render
    );


    sortSelect.addEventListener(
        "change",
        render
    );

    //Application start
    getBooks();

})();