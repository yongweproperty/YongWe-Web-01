const searchBox = document.getElementById('searchBox');
const filterDropdown = document.getElementById('filterDropdown');
const photos = document.querySelectorAll('.photo-card');

function filterGallery() {
    const filterText = searchBox.value.toLowerCase();
    const filterCategory = filterDropdown.value.toLowerCase();

    photos.forEach(photo => {
        const name = photo.getAttribute('data-name').toLowerCase();

        // Cek kecocokan teks
        const matchText = name.includes(filterText);
        // Cek kecocokan kategori (atau jika pilih 'semua')
        const matchCategory = (filterCategory === "semua" || name === filterCategory);

        if (matchText && matchCategory) {
            photo.style.display = ""; 
            photo.style.opacity = "1";
        } else {
            photo.style.display = "none";
        }
    });
}

// Jalankan fungsi filter saat ada input di searchBox
searchBox.addEventListener('keyup', filterGallery);

// Jalankan fungsi filter saat dropdown berubah
filterDropdown.addEventListener('change', filterGallery);