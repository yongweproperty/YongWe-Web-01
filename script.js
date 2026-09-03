document.addEventListener("DOMContentLoaded", () => {
  // ==========================================
  // KONFIGURASI PASSWORD ADMIN
  // ==========================================
  const ADMIN_PASSWORD = "YongWe82"; // Ganti password di sini sesuai keinginan

  // Helper Cek Status Admin
  function isAdminLoggedIn() {
    return localStorage.getItem('isAdminLoggedIn') === 'true';
  }

  // Fungsi memperbarui Tampilan sesuai Status Admin
  function updateAdminUI() {
    const isLogged = isAdminLoggedIn();
    const containerForm = document.getElementById('containerFormUpload');
    const loginContainer = document.getElementById('loginFormContainer');
    const loggedInContainer = document.getElementById('loggedInContainer');
    const deleteButtons = document.querySelectorAll('.btn-delete');

    // Tampilkan / Sembunyikan Form Upload
    if (containerForm) {
      containerForm.style.display = isLogged ? 'block' : 'none';
    }

    // Tampilkan / Sembunyikan Form Login Admin di bawah
    if (loginContainer && loggedInContainer) {
      loginContainer.style.display = isLogged ? 'none' : 'block';
      loggedInContainer.style.display = isLogged ? 'block' : 'none';
    }

    // Tampilkan / Sembunyikan semua tombol Hapus pada kartu
    deleteButtons.forEach(btn => {
      btn.style.display = isLogged ? 'block' : 'none';
    });
  }

  // Handler Login Admin
  const btnLogin = document.getElementById('btnLoginAdmin');
  const inputPassword = document.getElementById('inputAdminPassword');
  const errorMsg = document.getElementById('loginErrorMsg');

  if (btnLogin && inputPassword) {
    btnLogin.addEventListener('click', () => {
      if (inputPassword.value === ADMIN_PASSWORD) {
        localStorage.setItem('isAdminLoggedIn', 'true');
        inputPassword.value = '';
        if (errorMsg) errorMsg.style.display = 'none';
        updateAdminUI();
        alert("Berhasil masuk mode Admin! Form Upload dan fitur Hapus sekarang aktif.");
      } else {
        if (errorMsg) errorMsg.style.display = 'block';
      }
    });

    // Jalankan Login saat menekan tombol Enter
    inputPassword.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') btnLogin.click();
    });
  }

  // Handler Logout Admin
  const btnLogout = document.getElementById('btnLogoutAdmin');
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      localStorage.setItem('isAdminLoggedIn', 'false');
      updateAdminUI();
      alert("Anda telah keluar dari mode Admin.");
    });
  }

  // ==========================================
  // FUNGSI UTAMA KARTU & GALERI PROPERTI
  // ==========================================

  // 1. Fungsi Carousel Slider
  function initCarousel(card) {
    const wrapper = card.querySelector('.slider-wrapper');
    const track = card.querySelector('.slider-track');
    const images = card.querySelectorAll('.slider-track img');

    if (!wrapper || !track || images.length === 0) return;

    let currentIndex = 0;
    const totalImages = images.length;

    wrapper.addEventListener('click', (e) => {
      if (e.target.classList.contains('btn-delete')) return;

      currentIndex++;
      if (currentIndex >= totalImages) {
        currentIndex = 0;
      }
      track.style.transform = `translateX(-${currentIndex * 100}%)`;
    });
  }

  // Helper konversi URL YouTube
  function getYoutubeEmbedUrl(url) {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) 
      ? `https://www.youtube.com/embed/${match[2]}` 
      : '';
  }

  // Helper pembaca file foto ke Base64
  function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }

  // 2. Render Kartu Properti
  function renderCard(data, isNew = false) {
    const newCard = document.createElement('div');
    newCard.className = 'photo-card';
    newCard.setAttribute('data-name', `${data.kategori} ${data.judul}`);
    newCard.setAttribute('data-id', data.id);

    const embedUrl = getYoutubeEmbedUrl(data.youtubeUrl);
    const hasImages = data.images && data.images.length > 0;
    const hasVideo = Boolean(embedUrl);

    let topMediaHTML = '';
    let bottomVideoHTML = '';

    if (hasImages) {
      const imagesHTML = data.images.map(src => `<img src="${src}" alt="Foto Properti">`).join('');
      topMediaHTML = `
        <div class="slider-wrapper" title="Klik untuk melihat foto selanjutnya">
          <div class="slider-track">
            ${imagesHTML}
          </div>
          <div class="click-hint">Klik foto 👉</div>
        </div>
      `;
      if (hasVideo) {
        bottomVideoHTML = `
          <div class="video-container" style="margin-top: 15px; position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 6px;">
            <iframe src="${embedUrl}" style="position: absolute; top:0; left: 0; width: 100%; height: 100%; border: 0;" allowfullscreen></iframe>
          </div>
        `;
      }
    } else if (hasVideo) {
      topMediaHTML = `
        <div class="video-container-top" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 8px 8px 0 0;">
          <iframe src="${embedUrl}" style="position: absolute; top:0; left: 0; width: 100%; height: 100%; border: 0;" allowfullscreen></iframe>
        </div>
      `;
    }

    const pajakInfoHTML = data.pajakInfo ? `<p class="pajak-info">Sudah Termasuk Pajak & Biaya2</p>` : '';

    // Multiple Selling Points
    let sellingPointHTML = '';
    if (data.sellingPoint) {
      const points = Array.isArray(data.sellingPoint)
        ? data.sellingPoint
        : data.sellingPoint.split('\n').map(p => p.trim()).filter(Boolean);

      if (points.length > 0) {
        const listItems = points.map(pt => `<div style="margin-top: 3px;">✨ ${pt}</div>`).join('');
        sellingPointHTML = `
          <div class="selling-point-info" style="margin-top: 8px; font-size: 13px; color: #2e7d32; font-weight: 600;">
            <div style="text-decoration: underline; margin-bottom: 2px;">Selling Points:</div>
            ${listItems}
          </div>
        `;
      }
    }

    // Pengaturan tombol hapus (Hanya tampil jika Admin Logged In)
    const isLogged = isAdminLoggedIn();
    const deleteBtnStyle = isLogged ? 'block' : 'none';

    newCard.innerHTML = `
      ${topMediaHTML}
      <div class="card-content">
        <span class="badge-lokasi">${data.lokasi}</span>
        <h2 class="card-title">${data.judul}</h2>
        <div class="card-specs">
          <p><strong>LT:</strong> ${data.lt} | <strong>LB:</strong> ${data.lb}</p>
          <p><strong>Lantai:</strong> ${data.lantai} | <strong>Surat:</strong> ${data.surat}</p>
          <p><strong>Kamar Tidur:</strong> ${data.kt} | <strong>Kamar Mandi:</strong> ${data.km}</p>
          ${sellingPointHTML}
        </div>
        
        ${bottomVideoHTML}

        <p class="contact-info" style="margin-top: 12px; margin-bottom: 8px; font-size: 14px; color: #333;">
          Segera Hubungi: <br>
          <strong>YongWe Property</strong>
        </p>

        <div class="card-price">
          ${data.hargaCoret ? `<span class="harga-coret">${data.hargaCoret}</span>` : ''}
          <span class="harga-promo">${data.hargaPromo}</span>
          ${pajakInfoHTML}
        </div>
        <button class="btn-delete" style="display: ${deleteBtnStyle}; margin-top: 10px; background-color: #e74c3c; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; width: 100%;">Hapus Properti</button>
      </div>
    `;

    const galleryContainer = document.getElementById('gelery');
    if (galleryContainer) {
      if (isNew) {
        galleryContainer.prepend(newCard);
      } else {
        galleryContainer.appendChild(newCard);
      }
    }

    if (hasImages) {
      initCarousel(newCard);
    }

    // Listener Tombol Hapus
    const deleteBtn = newCard.querySelector('.btn-delete');
    deleteBtn.addEventListener('click', () => {
      if (confirm(`Yakin ingin menghapus properti "${data.judul}"?`)) {
        removePropertyFromStorage(data.id);
        newCard.remove();
      }
    });
  }

  // 3. Storage Handling
  function loadSavedProperties() {
    const saved = JSON.parse(localStorage.getItem('uploadedProperties') || '[]');
    saved.forEach(item => renderCard(item, false));
  }

  function savePropertyToStorage(data) {
    const saved = JSON.parse(localStorage.getItem('uploadedProperties') || '[]');
    saved.unshift(data);
    localStorage.setItem('uploadedProperties', JSON.stringify(saved));
  }

  function removePropertyFromStorage(id) {
    let saved = JSON.parse(localStorage.getItem('uploadedProperties') || '[]');
    saved = saved.filter(item => item.id !== id);
    localStorage.setItem('uploadedProperties', JSON.stringify(saved));
  }

  // Load Awal
  const initialCards = document.querySelectorAll('.photo-card');
  initialCards.forEach(card => initCarousel(card));
  loadSavedProperties();
  updateAdminUI(); // Terapkan status visibilitas admin saat halaman dimuat

  // 4. Submit Form
  const formTambah = document.getElementById('formTambahProperti');
  if (formTambah) {
    formTambah.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!isAdminLoggedIn()) {
        alert("Akses ditolak! Anda harus masuk sebagai Admin terlebih dahulu di bagian bawah halaman.");
        return;
      }

      const fotoFiles = Array.from(document.getElementById('inputFoto').files);
      const youtubeUrl = document.getElementById('inputYoutube').value.trim();
      const pajakInfoChecked = document.getElementById('inputPajakInfo') ? document.getElementById('inputPajakInfo').checked : false;

      const rawSellingPoint = document.getElementById('inputSellingPoint') ? document.getElementById('inputSellingPoint').value : '';
      const sellingPointList = rawSellingPoint
        .split('\n')
        .map(item => item.trim())
        .filter(item => item.length > 0);

      if (fotoFiles.length === 0 && !youtubeUrl) {
        alert("Harap pilih minimal 1 foto atau masukkan link video YouTube!");
        return;
      }

      const base64Images = await Promise.all(fotoFiles.map(readFileAsBase64));

      const propertyData = {
        id: Date.now().toString(),
        kategori: document.getElementById('inputKategori').value,
        judul: document.getElementById('inputJudul').value,
        lokasi: document.getElementById('inputLokasi').value,
        lt: document.getElementById('inputLT').value,
        lb: document.getElementById('inputLB').value,
        lantai: document.getElementById('inputLantai').value,
        surat: document.getElementById('inputSurat').value,
        kt: document.getElementById('inputKT').value,
        km: document.getElementById('inputKM').value,
        sellingPoint: sellingPointList,
        hargaCoret: document.getElementById('inputHargaCoret').value,
        hargaPromo: document.getElementById('inputHargaPromo').value,
        pajakInfo: pajakInfoChecked,
        youtubeUrl: youtubeUrl,
        images: base64Images
      };

      savePropertyToStorage(propertyData);
      renderCard(propertyData, true);

      formTambah.reset();
      if (document.getElementById('inputPajakInfo')) {
        document.getElementById('inputPajakInfo').checked = true;
      }
      
      filterGallery();
    });
  }
});

// 5. Filter & Pencarian
const searchBox = document.getElementById('searchBox');
const filterDropdown = document.getElementById('filterDropdown');

function filterGallery() {
  const filterText = searchBox ? searchBox.value.toLowerCase() : '';
  const filterCategory = filterDropdown ? filterDropdown.value.toLowerCase() : 'semua';
  const photos = document.querySelectorAll('.photo-card');

  photos.forEach(photo => {
    const name = (photo.getAttribute('data-name') || '').toLowerCase();
    const matchText = name.includes(filterText);
    const matchCategory = (filterCategory === "semua" || name.includes(filterCategory));

    if (matchText && matchCategory) {
      photo.style.display = "";
      photo.style.opacity = "1";
    } else {
      photo.style.display = "none";
    }
  });
}

if (searchBox) searchBox.addEventListener('keyup', filterGallery);
if (filterDropdown) filterDropdown.addEventListener('change', filterGallery);