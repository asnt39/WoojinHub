'use strict';
(() => {
  const paths = {grow:'grow.html', merge:'merge.html', adventure:'adventure.html', city:'city.html'};
  const titles = {grow:'우진이 키우기', merge:'머지 우진', adventure:'우리오', city:'Grand Theft Woojin'};
  const frames = new Map(), ready = new Set();
  const loading = document.getElementById('loading');
  let selected;

  // A hidden Canvas game still owns timers, memory and often a 60fps loop.
  // Create only the game the player actually opened, then preserve its state
  // when switching. Do not eagerly preload the other three engines.
  function frame(id) {
    if(frames.has(id)) return frames.get(id);
    const iframe = document.createElement('iframe');
    iframe.src = paths[id];
    iframe.title = titles[id];
    iframe.id = 'game-' + id;
    iframe.hidden = id !== selected;
    iframe.onload = () => {
      ready.add(id);
      iframe.contentWindow.postMessage({type:'game-visibility', active:id===selected}, location.origin);
      if(id === selected) loading.hidden = true;
    };
    frames.set(id, iframe);
    document.body.append(iframe);
    return iframe;
  }

  function show(id) {
    if(!paths[id]) id = 'grow';
    if(selected === id && frames.has(id)) return;
    selected = id;
    frame(id);
    for(const [name, iframe] of frames) {
      const isActive = name === id;
      iframe.hidden = !isActive;
      // onload will send the initial notification once the child is ready.
      if(ready.has(name)) iframe.contentWindow.postMessage({type:'game-visibility',active:isActive},location.origin);
    }
    for(const button of document.querySelectorAll('[data-game]')) {
      button.setAttribute('aria-selected', String(button.dataset.game === id));
      button.setAttribute('tabindex', button.dataset.game === id ? '0' : '-1');
    }
    loading.hidden = ready.has(id);
    history.replaceState(null, '', '#' + id);
  }

  document.querySelector('nav').onclick = event => {
    const button = event.target.closest('[data-game]');
    if(button) show(button.dataset.game);
  };
  document.querySelector('nav').onkeydown = event => {
    if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
    event.preventDefault();
    const order = Object.keys(paths);
    const index = order.indexOf(selected);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? order.length - 1 :
      (index + (event.key === 'ArrowRight' ? 1 : -1) + order.length) % order.length;
    show(order[next]);
    document.querySelector('[data-game="' + order[next] + '"]').focus();
  };
  addEventListener('message', event => {
    if(event.origin !== location.origin || ![...frames.values()].some(f=>f.contentWindow===event.source)) return;
    if(event.data?.type === 'switch-game') show(event.data.game);
  });
  show(location.hash.slice(1));
})();
