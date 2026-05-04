# Vizio - Premium OMDB Movie Search Experience 🎬

Vizio is a modern, high-performance web application built to interact with the [OMDB API](https://www.omdbapi.com/). It provides users with a seamless, Netflix-style interface to search, filter, and discover movies and series. 

Unlike standard API-fetching applications, Vizio focuses heavily on **Performance Optimization**, **API Quota Management**, and **User Experience (UX)**.

🔗 **Live Demo:** [Click Here to View Vizio](https://sameby.github.io/omdb-project/)

## 🚀 Key Architectural Features

*   **Smart Client-Side Filtering:** To prevent redundant network requests and save API quotas, Vizio fetches up to 50 results (deep pagination) at once. When users apply filters (Year, Genre, IMDb Rating), the application performs highly optimized client-side filtering on the cached dataset instead of re-fetching from the server.
*   **Regex Search Interceptor:** The OMDB API lacks fuzzy search capabilities. Vizio implements a custom Regex-based interceptor that sanitizes common typos (e.g., automatically correcting "spiderman" to "spider-man") before hitting the API, ensuring a smooth user experience.
*   **Persistent State Management (LocalStorage):** The app remembers the user's last search and active filters even after page reloads, using native browser `localStorage`.
*   **Advanced "Kids Mode" Algorithm:** A custom-built content filter that actively scans MPAA ratings (R, PG-13, NC-17) and genres, hiding inappropriate content and highlighting family-friendly movies.
*   **Dynamic Trailer Integration:** Instead of bloating the DOM with heavy YouTube `<iframe>` embeds, Vizio generates smart, dynamic YouTube search queries for each movie, allowing instant trailer access with zero performance cost.

## 🛠️ Technologies Used
*   **HTML5 & CSS3:** Semantic markup with a fully responsive, custom-built CSS architecture (Grid/Flexbox) featuring a sleek, dark-mode aesthetic.
*   **Vanilla JavaScript (ES6+):** Pure JS with no external frameworks. Heavy use of `async/await`, Fetch API, Array manipulation, and DOM rendering.
*   **OMDB API:** Used as the primary data source for fetching comprehensive movie details.

## ⚙️ Setup and Installation
Since this is a client-side (Frontend) application, no complex installation is required.

1. Clone the repository:
   
```bash
   git clone [https://github.com/SameBy/omdb-project.git](https://github.com/SameBy/omdb-project.git)