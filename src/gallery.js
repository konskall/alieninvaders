// Gallery Data
export const GALLERY_ITEMS = [
  {
    id: 1,
    title: "Nova Battleship",
    image: "https://konskall.github.io/alieninvaders/Gallery/nova_battle_ship.png",
    category: "enemies"
  },
  {
    id: 2,
    title: "Xenophages",
    image: "https://konskall.github.io/alieninvaders/Gallery/xenophages.png",
    category: "scenes"
  },
  {
    id: 3,
    title: "Assemble the Army",
    image: "https://konskall.github.io/alieninvaders/Gallery/assemble_the_army.png",
    category: "enemies"
  },
  {
    id: 4,
    title: "The Battle of the Singularity",
    image: "https://konskall.github.io/alieninvaders/Gallery/black_hole.png",
    category: "player"
  },
  {
    id: 5,
    title: "Ultimate Defence",
    image: "https://konskall.github.io/alieninvaders/Gallery/shileds_on.png",
    category: "backgrounds"
  },
  {
    id: 6,
    title: "Critical Hit",
    image: "https://konskall.github.io/alieninvaders/Gallery/critical_hit.png",
    category: "ui"
  },
   {
    id: 7,
    title: "Amalgama",
    image: "https://konskall.github.io/alieninvaders/Gallery/amalgama.png",
    category: "ui"
  },
  {
    id: 8,
    title: "Mothership",
    image: "https://konskall.github.io/alieninvaders/Gallery/mothership.png",
    category: "enemies"
  },
  {
    id: 9,
    title: "Yamato Gun",
    image: "https://konskall.github.io/alieninvaders/Gallery/yamato_gun.png",
    category: "scenes"
  },
  {
    id: 10,
    title: "The Headquarters Space Station",
    image: "https://konskall.github.io/alieninvaders/Gallery/the_station.png",
    category: "enemies"
  },
  {
    id: 11,
    title: "The Two Suns Battle",
    image: "https://konskall.github.io/alieninvaders/Gallery/two_suns.png",
    category: "player"
  },
  {
    id: 12,
    title: "The Hive",
    image: "https://konskall.github.io/alieninvaders/Gallery/the_hive.png",
    category: "backgrounds"
  },
  {
    id: 13,
    title: "Deadly Tentacles",
    image: "https://konskall.github.io/alieninvaders/Gallery/tentacles.png",
    category: "ui"
  },
   {
    id: 14,
    title: "Ultimate Attack",
    image: "https://konskall.github.io/alieninvaders/Gallery/super_weapon.png",
    category: "ui"
  },
  {
    id: 15,
    title: "Neutrino Laser Beam",
    image: "https://konskall.github.io/alieninvaders/Gallery/laser_beam.png",
    category: "ui"
  },
  // Προσθέστε περισσότερα artwork εδώ
];

// Gallery Manager Class
export class GalleryManager {
  constructor() {
    this.items = GALLERY_ITEMS;
    this.init();
  }

  init() {
    this.renderGallery();
    this.setupEventListeners();
  }

  renderGallery() {
    const galleryGrid = document.getElementById('gallery-grid');
    if (!galleryGrid) return;

    galleryGrid.innerHTML = '';

    this.items.forEach(item => {
      const galleryItem = document.createElement('div');
      galleryItem.className = 'gallery-item';
      galleryItem.innerHTML = `
        <img src="${item.image}" alt="${item.title}" loading="lazy">
        <div class="gallery-item-overlay">
          <div class="gallery-item-overlay-text">${item.title}</div>
        </div>
      `;

      galleryItem.addEventListener('click', () => this.openLightbox(item));
      galleryGrid.appendChild(galleryItem);
    });
  }

  openLightbox(item) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightbox-image');
    const lightboxTitle = document.getElementById('lightbox-title');

    lightboxImage.src = item.image;
    lightboxTitle.textContent = item.title;
    lightbox.classList.remove('hidden');
  }

  closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    lightbox.classList.add('hidden');
  }

  setupEventListeners() {
    // Gallery open/close buttons
    const galleryBtn = document.getElementById('gallery-btn');
    const galleryCloseBtn = document.getElementById('gallery-close-btn');
    const lightboxClose = document.querySelector('.lightbox-close');
    const lightbox = document.getElementById('lightbox');


    if (galleryBtn) {
      galleryBtn.addEventListener('click', () => this.showGallery());
    }

    if (galleryCloseBtn) {
      galleryCloseBtn.addEventListener('click', () => this.hideGallery());
    }

    if (lightboxClose) {
      lightboxClose.addEventListener('click', () => this.closeLightbox());
    }

    // Close lightbox when clicking outside
    if (lightbox) {
      lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
          this.closeLightbox();
        }
      });
    }
  }

  showGallery() {
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('gallery-screen').classList.remove('hidden');
  }

  hideGallery() {
    document.getElementById('gallery-screen').classList.add('hidden');
    document.getElementById('start-screen').classList.remove('hidden');
  }
}
