const API_KEY = 'a691de5c';
const BASE_URL = 'https://www.omdbapi.com/';

const searchInput = document.getElementById('search-input');
const movieGrid = document.getElementById('movie-grid');
const messageContainer = document.getElementById('message-container');
const typeFilter = document.getElementById('type-filter');
const genreFilter = document.getElementById('genre-filter');
const minYearInput = document.getElementById('min-year');
const maxYearInput = document.getElementById('max-year');
const imdbFilter = document.getElementById('imdb-filter');
const imdbDisplay = document.getElementById('imdb-display');
const kidsModeCheckbox = document.getElementById('kids-mode');
const sortFilter = document.getElementById('sort-filter');
const applyFiltersBtn = document.getElementById('apply-filters-btn');
const defaultTitle = document.getElementById('default-title');
const homeLogo = document.getElementById('home-logo');

let currentRawMovies = [];
let isDefaultState = true;

window.addEventListener('DOMContentLoaded', () => {
    loadState();
    applyFiltersBtn.disabled = true;
    
    const lastSearch = searchInput.value.trim();
    const lastSearchData = localStorage.getItem('omdbflix_last_results');
    
    if (lastSearch.length > 0 && lastSearchData) {
        isDefaultState = false;
        currentRawMovies = JSON.parse(lastSearchData);
        updateUI();
    } else if (lastSearch.length > 0) {
        isDefaultState = false;
        fetchMovies(sanitizeSearchTerm(lastSearch));
    } else {
        loadStaticMovies();
    }
});

if (homeLogo) {
    homeLogo.addEventListener('click', () => {
        const keysToRemove = [
            'lastSearchTerm', 'omdbflix_last_results', 'typeFilter', 
            'genreFilter', 'minYear', 'maxYear', 'imdbFilter', 
            'kidsMode', 'sortFilter'
        ];
        keysToRemove.forEach(key => localStorage.removeItem(key));
        window.location.reload();
    });
}
function saveState() {
    localStorage.setItem('typeFilter', typeFilter.value);
    localStorage.setItem('genreFilter', genreFilter.value);
    localStorage.setItem('minYear', minYearInput.value);
    localStorage.setItem('maxYear', maxYearInput.value);
    localStorage.setItem('imdbFilter', imdbFilter.value);
    localStorage.setItem('kidsMode', kidsModeCheckbox.checked);
    localStorage.setItem('sortFilter', sortFilter.value);
    localStorage.setItem('lastSearchTerm', searchInput.value.trim());
}

function loadState() {
    if(localStorage.getItem('typeFilter') !== null) typeFilter.value = localStorage.getItem('typeFilter');
    if(localStorage.getItem('genreFilter') !== null) genreFilter.value = localStorage.getItem('genreFilter');
    if(localStorage.getItem('minYear') !== null) minYearInput.value = localStorage.getItem('minYear');
    if(localStorage.getItem('maxYear') !== null) maxYearInput.value = localStorage.getItem('maxYear');
    
    if(localStorage.getItem('imdbFilter') !== null) {
        imdbFilter.value = localStorage.getItem('imdbFilter');
        imdbDisplay.innerText = parseFloat(imdbFilter.value).toFixed(1);
    } else {
        imdbDisplay.innerText = parseFloat(imdbFilter.value).toFixed(1);
    }
    
    if(localStorage.getItem('kidsMode') !== null) kidsModeCheckbox.checked = localStorage.getItem('kidsMode') === 'true';
    if(localStorage.getItem('sortFilter') !== null) sortFilter.value = localStorage.getItem('sortFilter');
    if(localStorage.getItem('lastSearchTerm') !== null) searchInput.value = localStorage.getItem('lastSearchTerm');
}

function checkIfFiltersChanged() {
    const savedType = localStorage.getItem('typeFilter') !== null ? localStorage.getItem('typeFilter') : "";
    const savedGenre = localStorage.getItem('genreFilter') !== null ? localStorage.getItem('genreFilter') : "";
    const savedMinYear = localStorage.getItem('minYear') !== null ? localStorage.getItem('minYear') : "";
    const savedMaxYear = localStorage.getItem('maxYear') !== null ? localStorage.getItem('maxYear') : "";
    const savedImdb = localStorage.getItem('imdbFilter') !== null ? localStorage.getItem('imdbFilter') : "1";
    const savedKids = localStorage.getItem('kidsMode') !== null ? localStorage.getItem('kidsMode') === 'true' : false;
    const savedSort = localStorage.getItem('sortFilter') !== null ? localStorage.getItem('sortFilter') : "default";

    const isChanged = (
        typeFilter.value !== savedType ||
        genreFilter.value !== savedGenre ||
        minYearInput.value !== savedMinYear ||
        maxYearInput.value !== savedMaxYear ||
        imdbFilter.value !== savedImdb ||
        kidsModeCheckbox.checked !== savedKids ||
        sortFilter.value !== savedSort
    );

    applyFiltersBtn.disabled = !isChanged;
}

const allInputs = [typeFilter, genreFilter, minYearInput, maxYearInput, imdbFilter, kidsModeCheckbox, sortFilter];
allInputs.forEach(el => {
    el.addEventListener('input', () => {
        if(el.id === 'imdb-filter') {
            imdbDisplay.innerText = parseFloat(imdbFilter.value).toFixed(1);
        }
        checkIfFiltersChanged();
    });
    el.addEventListener('change', () => {
        checkIfFiltersChanged();
        if (el.id === 'kids-mode') {
            applyFiltersBtn.disabled = false;
            applyFiltersBtn.click();
        }
    });
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        applyFiltersBtn.disabled = false;
        applyFiltersBtn.click();
    }
});

applyFiltersBtn.addEventListener('click', () => {
    applyFiltersBtn.disabled = true;
    
    const term = searchInput.value.trim();
    const previousTerm = localStorage.getItem('lastSearchTerm') || "";
    
    saveState();
    
    if (term.length === 0) {
        localStorage.removeItem('omdbflix_last_results');
        loadStaticMovies();
    } else if (term !== previousTerm && term.length >= 3) {
        isDefaultState = false;
        fetchMovies(sanitizeSearchTerm(term));
    } else if (term === previousTerm && term.length >= 3) {
        isDefaultState = false;
        updateUI(); 
    } else {
        alert("Arama için en az 3 harf girmelisiniz.");
        applyFiltersBtn.disabled = false;
    }
});

function loadStaticMovies() {
    isDefaultState = true;
    applyFiltersBtn.disabled = true;
    currentRawMovies = [...staticDefaultMovies];
    
    if(defaultTitle) defaultTitle.style.display = 'block';
    updateUI();
}

function sanitizeSearchTerm(term) {
    let cleanTerm = term.toLowerCase().trim().replace(/\s+/g, ' ');

    const dictionary = {
        "spiderman": "spider-man",
        "spider man": "spider-man",
        "ironman": "iron man",
        "xmen": "x-men",
        "x men": "x-men",
        "starwars": "star wars",
        "harrypotter": "harry potter",
        "bat man": "batman",
        "god father": "godfather",
        "lord of the rings": "the lord of the rings",
        "avenger": "avengers",
        "fast and furious": "the fast and the furious"
    };

    return dictionary[cleanTerm] || cleanTerm;
}

async function fetchMovies(searchTerm) {
    try {
        showMessage('Searching Deeply... <i class="fa-solid fa-spinner fa-spin"></i>');
        if(defaultTitle) defaultTitle.style.display = 'none';
        
        const typeValue = typeFilter.value ? `&type=${typeFilter.value}` : '';
        const yearValue = (minYearInput.value === maxYearInput.value && minYearInput.value !== "") ? `&y=${minYearInput.value}` : '';
        
        const response = await fetch(`${BASE_URL}?s=${searchTerm}${typeValue}${yearValue}&page=1&apikey=${API_KEY}`);
        const data = await response.json();

        if (data.Response === 'False') {
            currentRawMovies = [];
            updateUI();
            showMessage('No content found matching your criteria!');
            return;
        }

        let allResults = [...data.Search];
        const totalResults = parseInt(data.totalResults, 10);
        const totalPages = Math.ceil(totalResults / 10);
        const maxPagesToFetch = Math.min(totalPages, 5);

        if (maxPagesToFetch > 1) {
            const pagePromises = [];
            for (let i = 2; i <= maxPagesToFetch; i++) {
                pagePromises.push(
                    fetch(`${BASE_URL}?s=${searchTerm}${typeValue}${yearValue}&page=${i}&apikey=${API_KEY}`).then(res => res.json())
                );
            }
            const pagesData = await Promise.all(pagePromises);
            pagesData.forEach(page => {
                if (page.Response === 'True' && page.Search) {
                    allResults = allResults.concat(page.Search);
                }
            });
        }

        const uniqueResults = [];
        const map = new Map();
        for (const item of allResults) {
            if(!map.has(item.imdbID) && item.Type !== 'game'){
                map.set(item.imdbID, true);
                uniqueResults.push(item);
            }
        }

        const detailedPromises = uniqueResults.map(movie => 
            fetch(`${BASE_URL}?i=${movie.imdbID}&apikey=${API_KEY}`).then(res => res.json())
        );
        
        currentRawMovies = await Promise.all(detailedPromises);
        localStorage.setItem('omdbflix_last_results', JSON.stringify(currentRawMovies));
        
        updateUI();

    } catch (error) {
        showMessage('An error occurred. Please check your internet connection.');
    }
}

function updateUI() {
    if (currentRawMovies.length === 0) return;

    if (defaultTitle) {
        defaultTitle.style.display = isDefaultState ? 'block' : 'none';
    }

    let safeMovies = currentRawMovies.map(movie => ({
        ...movie,
        Genre: movie.Genre || "",
        imdbRating: movie.imdbRating || "0",
        Type: movie.Type || "",
        Rated: movie.Rated || "Not Rated"
    }));

    let processedMovies = applyFilters(safeMovies);
    processedMovies = applySorting(processedMovies);

    if (processedMovies.length === 0) {
        showMessage('No content matches your filters.');
    } else {
        renderMovies(processedMovies);
    }
}

function applyFilters(movies) {
    const minYear = parseInt(minYearInput.value) || 0;
    const maxYear = parseInt(maxYearInput.value) || 9999;
    const selectedGenre = genreFilter.value;
    const minImdb = parseFloat(imdbFilter.value) || 0;
    const isKidsMode = kidsModeCheckbox.checked;
    const selectedType = typeFilter.value;
    const safeRatings = ['G', 'PG', 'TV-Y', 'TV-Y7', 'TV-G', 'TV-PG'];

    return movies.filter(movie => {
        const movieYear = parseInt(movie.Year);
        const rating = parseFloat(movie.imdbRating) || 0;
        
        const isYearValid = movieYear >= minYear && movieYear <= maxYear;
        const isImdbValid = rating >= minImdb;
        const isGenreValid = selectedGenre === "" || (movie.Genre && movie.Genre.includes(selectedGenre));
        const isTypeValid = selectedType === "" || movie.Type === selectedType;

        let isKidsValid = true;
        if (isKidsMode) {
            const hasSafeRating = safeRatings.includes(movie.Rated);
            const isFamilyFriendly = movie.Genre && (movie.Genre.includes('Family') || movie.Genre.includes('Animation'));
            isKidsValid = movie.Rated === 'N/A' ? isFamilyFriendly : (hasSafeRating || isFamilyFriendly);
        }

        return isYearValid && isGenreValid && isImdbValid && isTypeValid && isKidsValid && movie.Type !== 'game';
    });
}

function applySorting(movies) {
    const sortValue = sortFilter.value;
    if (sortValue === 'default') return movies;
    
    return [...movies].sort((a, b) => {
        const yearA = parseInt(a.Year) || 0;
        const yearB = parseInt(b.Year) || 0;
        const imdbA = parseFloat(a.imdbRating) || 0;
        const imdbB = parseFloat(b.imdbRating) || 0;

        if (sortValue === 'year-asc') return yearA - yearB;
        if (sortValue === 'year-desc') return yearB - yearA;
        if (sortValue === 'imdb-desc') return imdbB - imdbA;
        return 0; 
    });
}

function renderMovies(movies) {
    messageContainer.classList.add('hidden');
    messageContainer.style.display = 'none';
    movieGrid.innerHTML = '';
    
    movies.forEach(movie => {
        const posterNotFound = 'https://placehold.co/300x450/121217/80808f?text=No\\nPoster';
        const posterError = 'https://placehold.co/300x450/121217/80808f?text=Load\\nError';
        const posterSrc = movie.Poster !== 'N/A' ? movie.Poster : posterNotFound;
        const safeTitle = movie.Title.replace(/"/g, '&quot;');
        
        const card = document.createElement('div');
        card.classList.add('movie-card');
        
        if(kidsModeCheckbox.checked && !isDefaultState) {
            card.style.boxShadow = "0 0 10px rgba(0, 210, 255, 0.2)";
        }
        
card.innerHTML = `
            <img src="${posterSrc}" alt="${safeTitle}" onerror="this.onerror=null; this.src='${posterError}';">
            <div class="movie-info">
                <h3 title="${safeTitle}">${safeTitle}</h3>
                
                <div style="font-size: 0.8rem; color: var(--text-dim); margin-bottom: 10px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${movie.Director !== 'N/A' ? movie.Director : 'Unknown'}">
                    <i class="fa-solid fa-clapperboard"></i> ${movie.Director !== 'N/A' ? movie.Director : 'Unknown'}
                </div>

                <div class="movie-meta">
                    <span><i class="fa-solid fa-calendar"></i> ${movie.Year}</span>
                    <span style="display: flex; align-items: center; gap: 5px; color: #f5c518; font-weight: bold;">
                        <span style="font-size: 0.65rem; border: 1px solid #f5c518; color: #f5c518; padding: 1px 4px; border-radius: 4px; letter-spacing: 0.5px; font-weight: normal;">IMDb</span>
                        <i class="fa-solid fa-star" style="color: #f5c518;"></i> ${movie.imdbRating !== 'N/A' ? movie.imdbRating : '-'}
                    </span>
                </div>
                
                <div style="margin-top: 10px; font-size: 0.75rem; color: var(--text-dim); display: flex; justify-content: space-between; align-items: center;">
                    <span>${movie.Genre.split(',')[0]}</span>
                    
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <a href="https://www.youtube.com/results?search_query=${encodeURIComponent(movie.Title + ' ' + movie.Year + ' trailer')}" target="_blank" title="Watch Trailer on YouTube" style="color: #ff0000; text-decoration: none; border: 1px solid rgba(255,0,0,0.3); padding: 2px 6px; border-radius: 4px; display: flex; align-items: center; gap: 4px; transition: 0.3s; background: rgba(255,0,0,0.05);">
                            <i class="fa-brands fa-youtube"></i> Trailer
                        </a>
                        <span style="border: 1px solid #1f1f27; padding: 2px 6px; border-radius: 4px;">${movie.Rated !== 'N/A' ? movie.Rated : 'Unrated'}</span>
                    </div>
                </div>
            </div>
        `;
        
        movieGrid.appendChild(card);
    });
    
    movieGrid.classList.remove('hidden');
    movieGrid.style.display = 'grid';
}

function showMessage(text) {
    messageContainer.innerHTML = text;
    messageContainer.classList.remove('hidden');
    messageContainer.style.display = 'block';
    movieGrid.innerHTML = '';
    movieGrid.classList.add('hidden');
    movieGrid.style.display = 'none';
}
