(() => {
  const PAGE_MAX_WIDTH = 430; // giữ đồng bộ với $page-width trong SCSS
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const intro = document.getElementById('intro');
  const scroll = document.getElementById('scroll');
  const label = document.getElementById('scrollLabel');
  let opened = false;

  // ---------------------------------------------------------
  // 1. INTRO – màn hình chờ (lơ lửng + nhãn pulse)
  // ---------------------------------------------------------
  const floatAnim = anime({
    targets: scroll,
    translateY: [-5, 5],
    direction: 'alternate',
    loop: true,
    easing: 'easeInOutSine',
    duration: 1800,
  });

  // const pulseAnim = anime({
  //   targets: label,
  //   opacity: [1, 0.55],
  //   direction: 'alternate',
  //   loop: true,
  //   easing: 'easeInOutSine',
  //   duration: 900,
  // });

  // ---------------------------------------------------------
  // 2. INTRO – nhấn để mở: cuộn giấy mở theo chiều dọc
  // ---------------------------------------------------------
  function openScroll() {
    if (opened) return;
    opened = true;
    floatAnim.pause();
    // pulseAnim.pause();
    playMusic();

    if (reduceMotion) return finishIntro();

    const topRod = scroll.querySelector('.scroll__rod--top');
    const bottomRod = scroll.querySelector('.scroll__rod--bottom');

    anime.timeline({ easing: 'easeOutCubic' })
      // Nhãn thu nhỏ rồi mờ
      .add({ targets: label, scale: 0.8, opacity: 0, duration: 300 })
      // Về đúng tâm + rung nhẹ một nhịp
      .add({
        targets: scroll,
        translateY: 0,
        rotate: [0, -1.2, 1.2, 0],
        duration: 350,
        easing: 'easeInOutSine',
      }, '-=100')
      // Mở dọc: chiều cao lan ra từ tâm lên/xuống (flex center giữ cân đối)
      .add({
        targets: scroll,
        height: window.innerHeight,
        width: Math.min(window.innerWidth, PAGE_MAX_WIDTH),
        duration: 1500,
        easing: 'easeInOutCubic',
      })
      // Hai trục nảy nhẹ khi giấy mở hết
      .add({ targets: topRod, translateY: [0, 8, 0], duration: 450, easing: 'easeOutBack' })
      .add({ targets: bottomRod, translateY: [0, -8, 0], duration: 450, easing: 'easeOutBack' }, '-=450')
      // Mờ dần để lộ thiệp
      .add({
        targets: intro,
        opacity: 0,
        duration: 700,
        easing: 'linear',
        complete: finishIntro,
      }, '+=150');
  }

  function finishIntro() {
    intro.style.display = 'none';
    document.body.classList.remove('is-locked');
    initReveal();
    showMusicBtn();
  }
  scroll.addEventListener('click', openScroll);


  // ---------------------------------------------------------
  // 2b. NHẠC NỀN
  // ---------------------------------------------------------
  const bgm = document.getElementById('bgm');
  const musicBtn = document.getElementById('musicBtn');
  let wasPlaying = false; // nhớ trạng thái để tiếp tục khi quay lại tab

  function setMusicState(on) {
    musicBtn.classList.toggle('is-playing', on);
    musicBtn.setAttribute('aria-pressed', String(on));
  }

  function playMusic() {
    bgm.volume = 0.6;
    const p = bgm.play();
    if (p && p.catch) p.catch((err) => {
      console.warn('Không phát được nhạc (thiếu assets/audio/music.mp3 hoặc bị chặn):', err);
      setMusicState(false);
    });
  }

  function showMusicBtn() {
    musicBtn.hidden = false;
    anime({ targets: musicBtn, opacity: [0, 1], scale: [0.6, 1], duration: 500, easing: 'easeOutBack' });
  }

  bgm.addEventListener('play', () => setMusicState(true));
  bgm.addEventListener('pause', () => setMusicState(false));

  musicBtn.addEventListener('click', () => {
    if (bgm.paused) playMusic(); else bgm.pause();
  });

  // Tạm dừng khi chuyển tab / khoá màn hình, tự phát lại khi quay lại
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      wasPlaying = !bgm.paused;
      bgm.pause();
    } else if (wasPlaying) {
      playMusic();
    }
  });

  // ---------------------------------------------------------
  // 3. REVEAL – hiện dần khi cuộn tới
  // ---------------------------------------------------------
  function initReveal() {
    const items = document.querySelectorAll('[data-reveal]');

    if (reduceMotion || !('IntersectionObserver' in window)) {
      items.forEach((el) => (el.style.opacity = 1));
      return;
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        io.unobserve(entry.target);
        anime({
          targets: entry.target,
          opacity: [0, 1],
          translateY: [24, 0],
          duration: 800,
          easing: 'easeOutCubic',
        });
      });
    }, { threshold: 0.15 });

    items.forEach((el) => io.observe(el));
  }

  // ---------------------------------------------------------
  // 4. COUNTDOWN
  // ---------------------------------------------------------
  const countdown = document.getElementById('countdown');
  const pad = (n) => String(n).padStart(2, '0');

  function getRemaining(target) {
    const now = new Date();
    if (now >= target) return { months: 0, weeks: 0, days: 0, seconds: 0 };

    let months = (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth());
    let anchor = new Date(now);
    anchor.setMonth(now.getMonth() + months);
    if (anchor > target) {
      months--;
      anchor = new Date(now);
      anchor.setMonth(now.getMonth() + months);
    }

    const rest = Math.floor((target - anchor) / 1000);
    const totalDays = Math.floor(rest / 86400);
    return {
      months,
      weeks: Math.floor(totalDays / 7),
      days: totalDays % 7,
      seconds: rest % 60,
    };
  }

  function tickCountdown() {
    const r = getRemaining(new Date(countdown.dataset.date));
    Object.keys(r).forEach((unit) => {
      countdown.querySelector(`[data-unit="${unit}"]`).textContent = pad(r[unit]);
    });
  }

  tickCountdown();
  setInterval(tickCountdown, 1000);

  // ---------------------------------------------------------
  // 5. RSVP – chọn tham dự / không tham dự
  // ---------------------------------------------------------
  const rsvpButtons = document.querySelectorAll('[data-attend]');
  rsvpButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      rsvpButtons.forEach((b) => b.classList.toggle('is-active', b === btn));
      // TODO: gửi dữ liệu form (Google Sheet / API) tại đây
    });
  });
})();
