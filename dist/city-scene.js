'use strict';
// Checkpoint B: scenery is assembled from independent, nearest-neighbour sprites.
// All positions are in the existing city's logical coordinates; physics and saves stay in city.js.
(() => {
  const A = window.CityArt;
  const make = (w, h, paint) => A.tile(w, h, paint);
  const r = (c, x, y, w, h, color) => {
    c.fillStyle = color;
    c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  };
  const hash = (x, y, salt = 0) => {
    let n = Math.imul(x + 73, 374761393) + Math.imul(y + salt + 19, 668265263);
    n = Math.imul(n ^ n >>> 13, 1274126177);
    return (n ^ n >>> 16) >>> 0;
  };
  const line = (c, x, y, w, h, light, shade) => {
    r(c, x, y, w, h, shade);
    r(c, x + 1, y + 1, Math.max(0, w - 2), Math.max(0, h - 2), light);
  };

  function pavement(c, x, y, w, h) {
    r(c, x, y, w, h, '#8b8b87');
    for (let py = y; py < y + h; py += 18) {
      for (let px = x; px < x + w; px += 18) {
        const n = hash(px, py) % 5;
        const tones = ['#a29f99', '#aaa7a0', '#9d9d99', '#b2ada3', '#aaa8a2'];
        r(c, px + 1, py + 1, 17, 17, tones[n]);
        r(c, px + 2, py + 2, 14, 1, '#c6c0b7');
        r(c, px + 1, py + 17, 17, 1, '#777c7d');
        if (hash(px, py, 17) % 5 === 0) r(c, px + 11, py + 7, 3, 1, '#787d7c');
        if (hash(px, py, 29) % 7 === 0) {
          r(c, px + 5, py + 11, 1, 4, '#7d827f');
          r(c, px + 6, py + 14, 3, 1, '#7d827f');
        }
      }
    }
  }

  function asphalt(c, x, y, w, h) {
    r(c, x, y, w, h, '#45454b');
    for (let py = y; py < y + h; py += 4) {
      for (let px = x; px < x + w; px += 4) {
        const n = hash(px, py, 71);
        if (n % 3 === 0) r(c, px + n % 3, py + (n >>> 4) % 3, 1, 1, '#5b595b');
        if (n % 11 === 0) r(c, px + 2, py, 1, 1, '#33393e');
      }
    }
  }

  function tactile(c, x, y, w, h) {
    r(c, x, y, w, h, '#d2a34e');
    r(c, x + 1, y + 1, w - 2, h - 2, '#e1b85c');
    for (let py = y + 3; py < y + h - 2; py += 5) {
      for (let px = x + 3; px < x + w - 2; px += 5) {
        r(c, px + 1, py + 1, 2, 2, '#b7833b');
        r(c, px, py, 2, 1, '#f0ce81');
      }
    }
  }

  function curb(c, x, y, w, h, horizontal = false) {
    r(c, x, y, w, h, '#696b6e');
    r(c, x + 1, y + 1, w - 2, h - 2, '#d2c9be');
    if (horizontal) {
      r(c, x, y + h - 2, w, 2, '#858080');
      for (let px = x; px < x + w; px += 32) r(c, px, y, 1, h, '#8d8a86');
    } else {
      r(c, x + w - 2, y, 2, h, '#858080');
      for (let py = y; py < y + h; py += 32) r(c, x, py, w, 1, '#8d8a86');
    }
  }

  function zebra(c, x, y, vertical, count = 6) {
    for (let i = 0; i < count; i++) {
      if (vertical) r(c, x + i * 15, y, 9, 43, '#ddd7ce');
      else r(c, x, y + i * 15, 43, 9, '#ddd7ce');
    }
  }

  function park(c) {
    r(c, 670, 510, 400, 190, '#506442');
    for (let y = 510; y < 700; y += 6) for (let x = 670; x < 1070; x += 6) {
      const n = hash(x, y, 6);
      if (n % 3 === 0) r(c, x, y, 3, 2, n % 2 ? '#697b49' : '#728b4e');
      if (n % 37 === 0) r(c, x + 2, y + 2, 2, 2, '#d2bb72');
      if (n % 53 === 0) r(c, x + 3, y, 2, 2, '#dc9ca1');
    }
    r(c, 705, 552, 330, 23, '#9a8d74');
    r(c, 812, 535, 24, 155, '#a89a7e');
    for (let x = 706; x < 1035; x += 9) if (hash(x, 550) % 3 === 0) r(c, x, 556, 5, 2, '#c0ad87');
    for (let y = 537; y < 687; y += 8) if (hash(812, y) % 3 === 0) r(c, 818, y, 4, 3, '#c0ad87');
    for (let x = 684; x < 1060; x += 24) {
      r(c, x, 511, 3, 14, '#283e33');
      r(c, x, 515, 3, 1, '#8b9a81');
    }
    r(c, 681, 517, 383, 3, '#344a3d');
    r(c, 681, 523, 383, 2, '#344a3d');
  }

  A.createGround = function (size) {
    return make(size, size, c => {
      pavement(c, 0, 0, size, size);
      asphalt(c, 390, 0, 210, size);
      asphalt(c, 0, 395, size, 100);
      // Keep the original driveable intersection bounds and path geometry.
      r(c, 480, 0, 10, 395, '#b88940');
      r(c, 500, 0, 2, 395, '#d9b36b');
      r(c, 480, 495, 10, size - 495, '#b88940');
      r(c, 500, 495, 2, size - 495, '#d9b36b');
      for (let y = 0; y < size; y += 46) {
        if (y > 370 && y < 526) continue;
        r(c, 485, y, 4, 24, '#e2c282');
      }
      r(c, 0, 408, 390, 3, '#d8ad5e');
      r(c, 600, 408, size - 600, 3, '#d8ad5e');
      r(c, 0, 481, 390, 3, '#d8ad5e');
      r(c, 600, 481, size - 600, 3, '#d8ad5e');
      for (let x = 24; x < size; x += 112) {
        if (x > 355 && x < 625) continue;
        r(c, x, 442, 52, 3, '#ddd8cc');
      }
      curb(c, 383, 0, 7, 395);
      curb(c, 600, 0, 7, 395);
      curb(c, 383, 495, 7, size - 495);
      curb(c, 600, 495, 7, size - 495);
      curb(c, 0, 388, 383, 7, true);
      curb(c, 607, 388, size - 607, 7, true);
      curb(c, 0, 495, 383, 7, true);
      curb(c, 607, 495, size - 607, 7, true);
      zebra(c, 400, 349, true, 12);
      zebra(c, 400, 502, true, 12);
      zebra(c, 349, 406, false, 5);
      zebra(c, 600, 406, false, 5);
      tactile(c, 359, 358, 24, 29);
      tactile(c, 607, 358, 25, 29);
      tactile(c, 359, 503, 24, 29);
      tactile(c, 607, 503, 25, 29);
      park(c);
      // Street utility covers stay decorative; no new movement blockers.
      for (const [x, y] of [[462, 600], [548, 205], [300, 460], [927, 460]]) {
        r(c, x, y, 16, 10, '#282e32');
        r(c, x + 1, y + 1, 14, 8, '#777b7b');
        for (let j = 2; j < 14; j += 3) r(c, x + j, y + 2, 1, 6, '#303a3c');
      }
    });
  };

  function aircon(c, x, y, w = 31, h = 23) {
    r(c, x + 3, y + 4, w, h, '#42454a88');
    line(c, x, y, w, h, '#c6c2b9', '#464b53');
    r(c, x + 3, y + 3, w - 6, h - 6, '#898d8f');
    r(c, x + 7, y + 6, w - 14, h - 12, '#4e555c');
    for (let j = 0; j < 3; j++) {
      r(c, x + 10 + j * 4, y + 8, 2, h - 16, '#9ba09d');
      r(c, x + 8, y + 8 + j * 3, w - 16, 1, '#9ba09d');
    }
    r(c, x + 2, y + 1, w - 4, 2, '#e9dcd1');
  }

  function roof(c, w, h, warm) {
    const stone = warm ? '#8d7770' : '#8f918e';
    r(c, 7, 5, w - 14, h - 8, stone);
    for (let y = 9; y < h - 10; y += 11) for (let x = 12; x < w - 12; x += 12) {
      const n = hash(x, y, w);
      if (n % 3 === 0) r(c, x + n % 5, y + 3, 5, 1, warm ? '#b4958a' : '#b0aaa2');
      if (n % 7 === 0) r(c, x + 2, y + 7, 1, 3, '#646b6b');
    }
    r(c, 0, 0, w, 7, '#666c72');
    r(c, 3, 1, w - 6, 3, '#c4c1b7');
    r(c, 0, 0, 7, h, '#73777a');
    r(c, 2, 6, 2, h - 8, '#ccc6bb');
    r(c, w - 8, 0, 8, h, '#344b63');
    r(c, w - 6, 2, 3, h - 4, '#8392a0');
    r(c, 8, h - 8, w - 16, 3, '#d2c6b6');
    // Technical rooftop details instead of flat empty polygons.
    aircon(c, 22, 18, 37, 28);
    aircon(c, Math.max(65, w - 70), 30, 29, 23);
    if (w > 280) aircon(c, 87, 20, 27, 25);
    r(c, 42, 48, w - 85, 3, '#595c61');
    r(c, 42, 49, w - 85, 1, '#c0bcb4');
    r(c, w - 37, 38, 4, Math.max(18, h - 90), '#73767b');
    r(c, w - 36, 39, 1, Math.max(18, h - 92), '#d4c9b9');
    for (let x = 14; x < w - 13; x += 25) r(c, x, h - 10, 1, 5, '#727578');
  }

  function windowPanel(c, x, y, w, h, door) {
    r(c, x, y, w, h, '#333c43');
    r(c, x + 2, y + 2, w - 4, h - 4, '#425866');
    r(c, x + 4, y + 3, w - 8, h - 6, '#71858a');
    if (!door) {
      r(c, x + 5, y + 11, w - 10, h - 16, '#293c4e');
      for (let i = 0; i < 3; i++) {
        r(c, x + 7 + i * 9, y + 7, 5, 7, ['#e5af64', '#83b5ab', '#c8b5a0'][i],);
        r(c, x + 6 + i * 9, y + 19, 6, 4, ['#c79364', '#b5c99d', '#c5a87d'][i]);
      }
      r(c, x + 5, y + 18, w - 10, 2, '#63717a');
      r(c, x + w - 9, y + 3, 3, h - 9, '#a9c0be');
    } else {
      r(c, x + w / 2, y + 2, 2, h - 4, '#c4c6bc');
      r(c, x + w / 2 - 5, y + 17, 2, 8, '#f3e2bf');
      r(c, x + w / 2 + 5, y + 17, 2, 8, '#f3e2bf');
      r(c, x + 5, y + 4, 3, 23, '#a3bec2');
    }
    r(c, x, y + h - 4, w, 4, '#4a5559');
    r(c, x + 1, y + h - 3, w - 2, 1, '#a9aea8');
  }

  function building(w, h, color, name) {
    const shop = name.includes('편의점'), record = name.includes('RECORDS');
    return make(w + 16, h + 22, c => {
      r(c, 13, 13, w, h + 9, '#252b3155');
      r(c, 8, 7, w, h + 7, '#555758');
      roof(c, w, h - 45, !shop);
      const f = h - 48;
      r(c, 2, f - 1, w - 4, 53, '#b7aba0');
      for (let x = 4; x < w - 5; x += 17) {
        for (let y = f + 4; y < h - 5; y += 8) {
          r(c, x + ((y - f) % 16 ? 6 : 0), y, 13, 1, '#948c87');
        }
        r(c, x, f + 2, 1, 47, '#9b908a');
      }
      const sign = shop ? '#284a81' : record ? '#3e423f' : color;
      r(c, 0, f, w, 17, '#3a474d');
      r(c, 0, f + 2, w, 11, sign);
      r(c, 0, f + 3, w, 2, shop ? '#d7dfe1' : '#d9c9a4');
      r(c, 0, f + 9, w, 3, shop ? '#df914f' : '#b89464');
      r(c, 1, f + 14, w - 2, 3, '#35475a');
      const panels = Math.max(3, Math.floor((w - 20) / 50));
      const width = Math.floor((w - 18) / panels);
      for (let i = 0; i < panels; i++) {
        const x = 9 + i * width;
        windowPanel(c, x, f + 20, width - 2, 29, i === Math.floor(panels / 2));
      }
      r(c, 4, h + 1, w - 8, 5, '#8d9290');
      r(c, 6, h + 1, w - 12, 2, '#d5d0c6');
      c.font = 'bold 10px monospace';
      c.textAlign = 'center';
      c.fillStyle = '#f5e9cb';
      c.fillText(shop ? 'NAMBIT 24' : record ? 'NAMBIT RECORDS' : name, w / 2, f + 22);
      if (shop) {
        // Corner-store fridge/vending unit and a low bin, independently drawn surfaces.
        r(c, w - 34, f + 20, 20, 27, '#1d2f51');
        r(c, w - 32, f + 22, 16, 19, '#577298');
        for (let y = 23; y < 40; y += 6) for (let x = w - 30; x < w - 18; x += 5) {
          r(c, x, f + y, 3, 4, ['#b5c6c4', '#d5a46d', '#8db2a9'][(x + y) % 3]);
        }
        r(c, w - 16, f + 25, 3, 8, '#d4d5c7');
      }
    });
  }

  function tree() {
    return make(54, 63, c => {
      r(c, 14, 53, 38, 7, '#20293055');
      r(c, 26, 33, 8, 26, '#4b3e35');
      r(c, 28, 35, 3, 23, '#987758');
      r(c, 19, 36, 8, 4, '#61513f');
      r(c, 32, 32, 8, 4, '#61513f');
      const clusters = [[13, 12, 28, 22], [4, 20, 29, 23], [24, 6, 25, 24], [23, 24, 29, 19], [11, 1, 29, 24]];
      for (const [x, y, w, h] of clusters) {
        r(c, x + 2, y + 4, w, h, '#233c2f');
        r(c, x, y, w, h - 4, '#3e6140');
        r(c, x + 2, y + 3, w - 7, h - 8, '#607a42');
        for (let yy = y + 2; yy < y + h - 4; yy += 4) for (let xx = x + 2; xx < x + w - 3; xx += 5) {
          const n = hash(xx, yy, x);
          if (n % 3 === 0) r(c, xx, yy, 5, 3, '#8f9d52');
          else if (n % 5 === 0) r(c, xx + 1, yy, 3, 2, '#a7aa57');
          else if (n % 7 === 0) r(c, xx, yy, 4, 2, '#2c5138');
        }
      }
    });
  }

  function car() {
    return make(32, 58, c => {
      r(c, 3, 11, 29, 45, '#1e253366');
      for (const y of [9, 40]) {
        r(c, 0, y, 5, 10, '#1d252c');
        r(c, 27, y, 5, 10, '#1d252c');
        r(c, 1, y + 2, 2, 6, '#46494a');
        r(c, 29, y + 2, 2, 6, '#46494a');
      }
      r(c, 4, 3, 24, 51, '#20272f');
      r(c, 6, 2, 20, 51, '#59656c');
      r(c, 8, 3, 16, 49, '#899097');
      r(c, 6, 9, 20, 12, '#3d444f');
      r(c, 7, 22, 18, 18, '#2b333e');
      r(c, 9, 22, 14, 16, '#61727d');
      r(c, 9, 22, 3, 15, '#abb2b1');
      r(c, 14, 22, 1, 16, '#293a48');
      r(c, 8, 40, 16, 9, '#3d444f');
      r(c, 10, 40, 12, 3, '#b1b7b4');
      r(c, 11, 45, 10, 1, '#29333c');
      r(c, 7, 8, 18, 2, '#d4c3b0');
      r(c, 6, 3, 7, 3, '#ead8a7');
      r(c, 19, 3, 7, 3, '#ead8a7');
      r(c, 7, 51, 7, 2, '#bd7664');
      r(c, 18, 51, 7, 2, '#bd7664');
      r(c, 6, 54, 20, 2, '#262e36');
      r(c, 0, 24, 4, 3, '#b2b0a0');
      r(c, 28, 24, 4, 3, '#b2b0a0');
    });
  }

  function lamp(c, x, y) {
    r(c, x + 6, y + 2, 20, 4, '#28383d44');
    r(c, x, y - 41, 5, 44, '#2f363c');
    r(c, x + 1, y - 40, 2, 39, '#8f8f8d');
    r(c, x + 1, y - 39, 19, 4, '#444952');
    r(c, x + 13, y - 44, 14, 6, '#3c4146');
    r(c, x + 15, y - 42, 10, 2, '#e2d6b2');
    r(c, x + 2, y - 3, 7, 3, '#363b40');
  }

  function bench(c, x, y) {
    r(c, x + 5, y + 17, 63, 5, '#192b2944');
    for (let j = 0; j < 4; j++) {
      r(c, x, y + j * 4, 60, 3, j % 2 ? '#8e6543' : '#ae8157');
      r(c, x + 1, y + j * 4, 58, 1, '#d0a16a');
    }
    r(c, x + 4, y + 13, 3, 12, '#333a3a');
    r(c, x + 53, y + 13, 3, 12, '#333a3a');
  }

  function vending(c, x, y) {
    r(c, x + 3, y + 4, 17, 25, '#1a293744');
    r(c, x, y, 16, 24, '#28445f');
    r(c, x + 1, y + 2, 14, 3, '#8dabc5');
    r(c, x + 2, y + 6, 10, 11, '#3c6478');
    for (let i = 0; i < 6; i++) r(c, x + 3 + i % 3 * 3, y + 7 + Math.floor(i / 3) * 5, 2, 4, ['#bd7060', '#e5c48a', '#9bb6a8'][i % 3]);
    r(c, x + 12, y + 9, 2, 5, '#ded8c3');
    r(c, x + 3, y + 19, 7, 2, '#1d2f39');
  }

  function bollard(c, x, y) {
    r(c, x + 2, y + 7, 9, 4, '#23372e55');
    r(c, x, y - 9, 7, 19, '#3b4549');
    r(c, x + 1, y - 8, 4, 16, '#89918c');
    r(c, x, y - 5, 7, 3, '#e1b254');
    r(c, x, y - 9, 7, 2, '#c2c2b2');
  }

  A.renderProps = function (ctx) {
    for (const [x, y] of [[370, 350], [620, 530], [80, 650], [1100, 400]]) lamp(ctx, x, y);
    bench(ctx, 780, 580);
    vending(ctx, 100, 345);
    for (const [x, y] of [[325, 340], [660, 545], [1060, 525], [1075, 525]]) bollard(ctx, x, y);
    r(ctx, 86, 641, 23, 3, '#445b54');
    r(ctx, 88, 644, 20, 5, '#29443c');
  };
  A.building = building;
  A.tree = tree();
  A.car = car();
})();
