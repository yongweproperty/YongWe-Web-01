document.addEventListener("DOMContentLoaded", () => {
    // 1. Cari semua kartu properti di halaman
    const allCards = document.querySelectorAll('.photo-card');

    // 2. Terapkan sistem carousel ke masing-masing kartu
    allCards.forEach(card => {
        const wrapper = card.querySelector('.slider-wrapper');
        const track = card.querySelector('.slider-track');
        const images = card.querySelectorAll('.slider-track img');

        // Lewati jika kartunya tidak punya gambar
        if (!wrapper || !track || images.length === 0) return;

        let currentIndex = 0;
        const totalImages = images.length;

        // 3. Tambahkan event klik pada area foto
        wrapper.addEventListener('click', () => {
            // Tambah index untuk geser ke foto selanjutnya
            currentIndex++;

            // Jika sudah foto terakhir, kembali ke 0 (foto pertama)
            if (currentIndex >= totalImages) {
                currentIndex = 0;
            }

            // Lakukan pergeseran menggunakan CSS transform
            track.style.transform = `translateX(-${currentIndex * 100}%)`;
        });
    });
});
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
