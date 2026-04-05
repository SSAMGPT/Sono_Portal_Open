import { preloadImages } from './utils.js';

const calculateInitialTransform = (element, offsetDistance = 250, maxRotation = 300, maxZTranslation = 2000) => {
  const viewportCenter = { width: window.innerWidth / 2, height: window.innerHeight / 2 };
  const elementCenter = { 
    x: element.offsetLeft + element.offsetWidth / 2, 
    y: element.offsetTop + element.offsetHeight / 2 
  };

  const angle = Math.atan2(Math.abs(viewportCenter.height - elementCenter.y), Math.abs(viewportCenter.width - elementCenter.x));
  const translateX = Math.abs(Math.cos(angle) * offsetDistance);
  const translateY = Math.abs(Math.sin(angle) * offsetDistance);
  const maxDistance = Math.sqrt(Math.pow(viewportCenter.width, 2) + Math.pow(viewportCenter.height, 2));
  const currentDistance = Math.sqrt(Math.pow(viewportCenter.width - elementCenter.x, 2) + Math.pow(viewportCenter.height - elementCenter.y, 2));
  const distanceFactor = currentDistance / maxDistance;

  const rotationX = ((elementCenter.y < viewportCenter.height ? -1 : 1) * (translateY / offsetDistance) * maxRotation * distanceFactor);
  const rotationY = ((elementCenter.x < viewportCenter.width ? 1 : -1) * (translateX / offsetDistance) * maxRotation * distanceFactor);
  const translateZ = maxZTranslation * distanceFactor;

  return {
    x: elementCenter.x < viewportCenter.width ? -translateX : translateX,
    y: elementCenter.y < viewportCenter.height ? -translateY : translateY,
    z: translateZ,
    rotateX: rotationX,
    rotateY: rotationY
  };
};

const animateIntro = () => {
  const grid = document.querySelector('[data-grid-fourth]');
  const introTitle = document.querySelector('.intro-title');
  if(!grid) return;
  const gridImages = grid.querySelectorAll('.grid__img');

  const tl = gsap.timeline();

  // 1. Initial State Settings
  gsap.set(grid, { perspective: 1000 });
  gsap.set(introTitle, { xPercent: -50, yPercent: -50, y: 30, autoAlpha: 0 }); // 텍스트/로고를 정중앙에서 살짝 아래로 숨겨둠
  
  gsap.set(gridImages, {
    x: (_, el) => calculateInitialTransform(el).x,
    y: (_, el) => calculateInitialTransform(el).y,
    z: (_, el) => calculateInitialTransform(el).z, 
    rotateX: (_, el) => calculateInitialTransform(el).rotateX*.5,
    rotateY: (_, el) => calculateInitialTransform(el).rotateY,
    autoAlpha: 0,
    scale: 0.7,
  });

  // 2. 타이틀 나타내기
  tl.to(introTitle, {
    autoAlpha: 1,
    y: 0,
    duration: 1.5,
    ease: "power3.out"
  })
  // 3. 지정된 시간(0.5초) 유지 후 위로 사라지기 
  .to(introTitle, {
    autoAlpha: 0,
    y: -30,
    duration: 1,
    ease: "power3.in",
    delay: 0.5
  })
  // 4. 타이틀이 지워지는 도중 이미지 조립 시작 
  .to(gridImages, {
    x: 0,
    y: 0,
    z: 0,
    rotateX: 0,
    rotateY: 0,
    autoAlpha: 1,
    scale: 1,
    stagger: 0.2, 
    duration: 2.5,
    ease: "expo.out"
  }, "-=0.3");

  // Hover interaction for the split images
  gridImages.forEach(img => {
    img.style.pointerEvents = 'auto'; // allow mouse events
    img.style.transition = 'filter 0.4s ease'; // smooth transition for brightness
    
    const activate = () => {
      gridImages.forEach(otherImg => {
        if (otherImg !== img) {
          otherImg.style.filter = 'brightness(20%)';
          otherImg.classList.remove('is-hovered');
        } else {
          otherImg.style.filter = 'brightness(100%)';
          otherImg.classList.add('is-hovered');
        }
      });
    };
    
    const deactivate = () => {
      gridImages.forEach(otherImg => {
        otherImg.style.filter = 'brightness(100%)';
        otherImg.classList.remove('is-hovered');
      });
    };

    img.addEventListener('mouseenter', activate);
    img.addEventListener('mouseleave', deactivate);
    // 모바일 터치 대응 (빈 click 리스너만 추가해도 iOS 사파리에서 hover를 인식하게 함)
    img.addEventListener('click', activate);
    img.addEventListener('touchstart', () => activate(), { passive: true });
  });
};

const init = () => {
  animateIntro();
};

preloadImages('.grid__img').then(() => {
  document.body.classList.remove('loading');
  init();
  window.scrollTo(0, 0);
});
