'use strict';

const fs = require('fs');
const utils = require('./utils');

(async () => {
  const items = [
    81030,  // アクリルミニ X20A　(大徳用)
    81040,  // アクリル溶剤特大(X-20A 250ml)
    ...Array.from({ length: 99 }, (_, i) => 81501 + i),// つやあり系
    ...Array.from({ length: 99 }, (_, i) => 81701 + i),// つや消し系
  ];

  const list = await utils.getList(items);

  const FILENAME = 'list-acrylic-paint-mini';

  // JSON
  const json = JSON.stringify(list);
  fs.writeFileSync(`${FILENAME}.json`, json, 'utf8');
  console.log(`write ${FILENAME}.json`);

  // CSV
  utils.outputCsv(FILENAME, list);
  console.log(`write ${FILENAME}.csv`);
})();