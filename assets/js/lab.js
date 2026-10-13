(function () {
  'use strict';
  const menuButton = document.querySelector('.lab-menu-toggle');
  const menu = document.getElementById('lab-navigation');
  const smallScreen = window.matchMedia('(max-width: 900px)');
  function resetMenu() {
    if (!menu || !menuButton) return;
    menu.hidden = smallScreen.matches;
    menuButton.setAttribute('aria-expanded', String(!menu.hidden));
  }
  resetMenu();
  smallScreen.addEventListener('change', resetMenu);
  if (menuButton) menuButton.addEventListener('click', () => {
    menu.hidden = !menu.hidden;
    menuButton.setAttribute('aria-expanded', String(!menu.hidden));
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && smallScreen.matches && menu && !menu.hidden) {
      menu.hidden = true;
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.focus();
    }
  });
  const cards = Array.from(document.querySelectorAll('[data-project]'));
  const query = document.getElementById('project-query');
  const type = document.getElementById('project-type');
  const area = document.getElementById('project-area');
  if (cards.length && query && type && area) {
    document.querySelector('.project-filters').hidden = false;
    const apply = () => {
      const words = query.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
      let count = 0;
      for (const card of cards) {
        const match = words.every(word => card.textContent.toLowerCase().includes(word)) && (!type.value || card.dataset.type.split('|').includes(type.value)) && (!area.value || card.dataset.area === area.value);
        card.hidden = !match;
        if (match) count++;
      }
      document.getElementById('project-count').textContent = count + (count === 1 ? ' project' : ' projects');
      document.getElementById('no-projects').hidden = count !== 0;
    };
    query.addEventListener('input', apply);
    type.addEventListener('change', apply);
    area.addEventListener('change', apply);
    const reset = () => { query.value = ''; type.value = ''; area.value = ''; apply(); };
    document.getElementById('reset-projects').addEventListener('click', reset);
    function openLinkedProject() {
      const id = window.location.hash.slice(1);
      const card = cards.find(item => item.id === id);
      if (!card) return;
      reset();
      card.querySelector('details').open = true;
      requestAnimationFrame(() => card.scrollIntoView({ block: 'start' }));
    }
    const presetType = new URLSearchParams(window.location.search).get('type');
    if (Array.from(type.options).some(option => option.value === presetType)) {
      type.value = presetType;
      apply();
    }
    window.addEventListener('hashchange', openLinkedProject);
    openLinkedProject();
  }
  // Same-page project search results must also dismiss the search overlay.
  document.addEventListener('click', event => {
    if (!event.target.closest('.search-result-item')) return;
    const overlay = document.getElementById('searchOverlay');
    if (overlay) overlay.classList.remove('open');
  });
  // All research clips play together, muted; no exclusive-play behavior.
  const videos = Array.from(document.querySelectorAll('video[autoplay]'));
  const videoToggle = document.querySelector('[data-video-toggle]');
  const updateVideoControl = () => {
    if (!videoToggle) return;
    const playing = videos.some(video => !video.paused);
    videoToggle.textContent = playing ? 'Pause all videos' : 'Play all videos';
    videoToggle.setAttribute('aria-label', videoToggle.textContent);
  };
  const playVideo = video => {
    video.muted = true;
    video.defaultMuted = true;
    const attempt = video.play();
    if (attempt && attempt.catch) attempt.catch(updateVideoControl);
  };
  if (videos.length) {
    if (videoToggle) videoToggle.hidden = false;
    videos.forEach(video => {
      video.addEventListener('play', updateVideoControl);
      video.addEventListener('pause', updateVideoControl);
      playVideo(video);
    });
    if (videoToggle) videoToggle.addEventListener('click', () => {
      if (videos.some(video => !video.paused)) videos.forEach(video => video.pause());
      else videos.forEach(playVideo);
      updateVideoControl();
    });
  }
  document.querySelectorAll('[data-restart-pair]').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('video[data-pair="' + button.dataset.restartPair + '"]').forEach(video => {
        video.currentTime = 0;
        playVideo(video);
      });
    });
  });
})();
