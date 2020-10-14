const assert = require('power-assert');

const Sequtil = require('../index');

const config = {
  size: 50,
  maxSize: 500,
  minSize: 1
};
const sequtil = new Sequtil(config);

describe('sequtil-genOrder', () => {
  it('setConfig', async () => {
    const cf = {
      size: 1,
      maxSize: 1,
      minSize: 1
    };

    const su = new Sequtil();
    su.setConfig(cf);

    assert.deepEqual(cf, su.getConfig());
  });

  it('default', async () => {
    const page = sequtil.genPage({}, {});

    assert.deepEqual(page.page, 1);
    assert.deepEqual(page.pageSize, config.size);
    assert.deepEqual(page.limit, page.pageSize);
    assert.deepEqual(page.offset, (page.page - 1) * page.pageSize);
  });

  it('error page', async () => {
    const page1 = sequtil.genPage({ page: undefined }, {});
    assert.deepEqual(page1.page, 1);

    const page2 = sequtil.genPage({ page: 0 }, {});
    assert.deepEqual(page2.page, 1);

    const page3 = sequtil.genPage({ page: -1 }, {});
    assert.deepEqual(page3.page, 1);

    const page4 = sequtil.genPage({ page: 'a' }, {});
    assert.deepEqual(page4.page, 1);

    const page5 = sequtil.genPage({ page: true }, {});
    assert.deepEqual(page5.page, 1);
  });

  it('error pageSize', async () => {
    const page1 = sequtil.genPage({ pageSize: config.minSize - 1 }, {});
    assert.deepEqual(page1.pageSize, config.minSize);

    const page2 = sequtil.genPage({ pageSize: config.maxSize + 1 }, {});
    assert.deepEqual(page2.pageSize, config.maxSize);
  });

  it('page', async () => {
    const page1 = sequtil.genPage({ page: 1, pageSize: 1 }, {});
    assert.deepEqual(page1.page, 1);
    assert.deepEqual(page1.pageSize, 1);
    assert.deepEqual(page1.offset, 0);
    assert.deepEqual(page1.limit, 1);

    const page2 = sequtil.genPage({ page: 2, pageSize: 2 }, {});
    assert.deepEqual(page2.page, 2);
    assert.deepEqual(page2.pageSize, 2);
    assert.deepEqual(page2.offset, 2);
    assert.deepEqual(page2.limit, 2);
  });
});
