(() => {
  const MIN_RATIO = 4 / 5;   // Instagram의 최대 세로 비율 (4:5)
  const MAX_RATIO = 1.91;    // Instagram의 최대 가로 비율 (1.91:1)

  const uploadZone = document.getElementById('uploadZone');
  const fileInput = document.getElementById('fileInput');
  const postCard = document.getElementById('postCard');
  const carousel = document.getElementById('carousel');
  const carouselTrack = document.getElementById('carouselTrack');
  const carouselDots = document.getElementById('carouselDots');
  const carouselCounter = document.getElementById('carouselCounter');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const resetBtn = document.getElementById('resetBtn');

  let objectUrls = [];
  let slideCount = 0;
  let activeIndex = 0;

  function clampRatio(ratio) {
    return Math.min(Math.max(ratio, MIN_RATIO), MAX_RATIO);
  }

  function loadImage(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => resolve({ url, width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = reject;
      img.src = url;
    });
  }

  function clearCarousel() {
    objectUrls.forEach((url) => URL.revokeObjectURL(url));
    objectUrls = [];
    carouselTrack.innerHTML = '';
    carouselDots.innerHTML = '';
  }

  async function handleFiles(fileList) {
    const files = Array.from(fileList).filter((f) => f.type.startsWith('image/'));
    if (files.length === 0) return;

    let images;
    try {
      images = await Promise.all(files.map(loadImage));
    } catch (err) {
      alert('이미지를 불러오지 못했어요. 다른 파일을 시도해 주세요.');
      return;
    }

    clearCarousel();
    objectUrls = images.map((img) => img.url);

    const firstRatio = images[0].width / images[0].height;
    const mediaRatio = clampRatio(firstRatio);
    carousel.style.setProperty('--media-ratio', mediaRatio);

    images.forEach((img) => {
      const slide = document.createElement('div');
      slide.className = 'carousel-slide';
      const imgEl = document.createElement('img');
      imgEl.src = img.url;
      imgEl.alt = '업로드된 이미지';
      slide.appendChild(imgEl);
      carouselTrack.appendChild(slide);
    });

    slideCount = images.length;
    activeIndex = 0;
    carousel.scrollLeft = 0;

    const showControls = slideCount > 1;
    prevBtn.hidden = !showControls;
    nextBtn.hidden = !showControls;
    carouselCounter.hidden = !showControls;
    carouselDots.hidden = !showControls;

    if (showControls) {
      for (let i = 0; i < slideCount; i++) {
        const dot = document.createElement('span');
        dot.className = 'dot';
        carouselDots.appendChild(dot);
      }
    }

    updateCarouselUI();

    uploadZone.hidden = true;
    postCard.hidden = false;
  }

  function updateCarouselUI() {
    const dots = carouselDots.querySelectorAll('.dot');
    dots.forEach((dot, i) => dot.classList.toggle('active', i === activeIndex));
    carouselCounter.textContent = `${activeIndex + 1}/${slideCount}`;
    prevBtn.disabled = activeIndex === 0;
    nextBtn.disabled = activeIndex === slideCount - 1;
  }

  function goToSlide(index) {
    activeIndex = Math.min(Math.max(index, 0), slideCount - 1);
    carousel.scrollTo({ left: activeIndex * carousel.clientWidth, behavior: 'smooth' });
  }

  let scrollRaf = null;
  carousel.addEventListener('scroll', () => {
    if (scrollRaf) cancelAnimationFrame(scrollRaf);
    scrollRaf = requestAnimationFrame(() => {
      if (carousel.clientWidth === 0) return;
      const index = Math.round(carousel.scrollLeft / carousel.clientWidth);
      if (index !== activeIndex) {
        activeIndex = index;
        updateCarouselUI();
      }
    });
  });

  prevBtn.addEventListener('click', () => goToSlide(activeIndex - 1));
  nextBtn.addEventListener('click', () => goToSlide(activeIndex + 1));

  uploadZone.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
    fileInput.value = '';
  });

  ['dragenter', 'dragover'].forEach((evt) => {
    uploadZone.addEventListener(evt, (e) => {
      e.preventDefault();
      uploadZone.classList.add('dragover');
    });
  });

  ['dragleave', 'drop'].forEach((evt) => {
    uploadZone.addEventListener(evt, (e) => {
      e.preventDefault();
      uploadZone.classList.remove('dragover');
    });
  });

  uploadZone.addEventListener('drop', (e) => {
    if (e.dataTransfer && e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  });

  resetBtn.addEventListener('click', () => {
    clearCarousel();
    postCard.hidden = true;
    uploadZone.hidden = false;
  });
})();
