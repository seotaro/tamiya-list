'use strict';

const fs = require('fs');
const utils = require('./utils');

(async () => {
  const items = [
    ...Array.from({ length: 99 }, (_, i) => 82101 + i),
  ];

  const list = await utils.getList(items);

  const FILENAME = 'list-lacquer-paint';

  // JSON
  const json = JSON.stringify(list);
  fs.writeFileSync(`${FILENAME}.json`, json, 'utf8');
  console.log(`write ${FILENAME}.json`);

  // CSV
  utils.outputCsv(FILENAME, list);
  console.log(`write ${FILENAME}.csv`);
})();