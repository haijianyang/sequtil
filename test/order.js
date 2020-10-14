const assert = require('power-assert');

const Sequtil = require('../index');

const sequtil = new Sequtil();

describe('sequtil-genOrder', () => {
  it('none', async () => {
    const order = sequtil.genOrder(undefined, {});

    assert.deepEqual(order, []);
  });

  it('default', async () => {
    const def = ['field', 'DESC'];

    const order = sequtil.genOrder(undefined, { default: def });

    assert.deepEqual(order.length, 1);
    assert.deepEqual(order[0], def);
  });

  it('one', async () => {
    const order = sequtil.genOrder('field1:asc', { field1: null });

    assert.deepEqual(order.length, 1);
    assert.deepEqual(order[0], ['field1', 'asc']);
  });

  it('two', async () => {
    const order = sequtil.genOrder('field1:asc,field2:desc', { field1: null, field2: null });

    assert.deepEqual(order.length, 2);
    assert.deepEqual(order[0], ['field1', 'asc']);
    assert.deepEqual(order[1], ['field2', 'desc']);
  });

  it('filter field', async () => {
    const order = sequtil.genOrder('field1:asc,field2:desc', { field1: null, field3: null });

    assert.deepEqual(order.length, 1);
    assert.deepEqual(order[0], ['field1', 'asc']);
  });

  it('filter error sorting', async () => {
    const order = sequtil.genOrder('field1:asc,field2:error', { field1: null, field2: null });

    assert.deepEqual(order.length, 1);
    assert.deepEqual(order[0], ['field1', 'asc']);
  });
});
