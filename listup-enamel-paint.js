'use strict';

const { JSDOM } = require('jsdom');
const fs = require('fs');

const utils = require('./utils');

const parse = (url) => {
  return fetch(url)
    .then(response => {
      if (response.status !== 200) {
        throw new Error(`failed to fetch ${response.status}, ${response.statusText}`);
      }
      return response.arrayBuffer();
    })
    .then(data => new TextDecoder('shift-jis').decode(data))
    .then(html => {
      const dom = new JSDOM(html);
      const document = dom.window.document;

      const item_title_block_ = document.querySelector('.item_title_block_');

      const ja = ((element) => {
        const h1 = element.querySelector('h1');
        const str = h1.textContent
          .replace(/\n/g, '')
          .replace(/エナメル /ug, '')
          .split(' ');
        return [str[0], str.slice(1).join(' ')]
      })(item_title_block_);

      const en = ((element) => {
        const spans = element.querySelectorAll('span');
        const str = spans[1].textContent
          .replace(/\n/g, '')
          .split(' ');
        return [str[0], str.slice(1).join(' ')]
      })(item_title_block_);

      return { code: ja[0], name: { ja: ja[1], en: en[1] } };
    })
}

(async () => {
  const END_POINT = 'https://www.tamiya.com/japan/products/';

  const items = [
    ...Array.from({ length: 99 }, (_, i) => 80001 + i),// つやあり系
    ...Array.from({ length: 99 }, (_, i) => 80301 + i),// つや消し系
  ];

  const list = [];

  // サーバー側の付加を考えて愚直に順番にスクレイピングする
  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    // 例外処理
    if (item === 80040) {
      const res = { code: 'X-20', name: { ja: 'エナメル溶剤特大(250ml)', en: 'Enamel thinner (250ml)' } };
      list.push({ item, ...res });
      console.log(`${item}, ${res.code}, ${res.name.ja}, ${res.name.en}`);
      continue;
    }

    try {
      const res = await parse(`${END_POINT}/${item}/index.html`, item);
      list.push({ item, ...res });
      console.log(`${item}, ${res.code}, ${res.name.ja}, ${res.name.en}`);

    } catch (e) {
      console.log(`${item}: ${e.message}`);
    }
  }

  const FILENAME = 'list-enamel-paint';

  // JSON
  const json = JSON.stringify(list);
  fs.writeFileSync(`${FILENAME}.json`, json, 'utf8');
  console.log(`write ${FILENAME}.json`);

  // CSV
  utils.outputCsv(FILENAME, list);
  console.log(`write ${FILENAME}.csv`);
})();