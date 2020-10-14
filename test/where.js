const assert = require('power-assert');

const Sequtil = require('../index');

const sequtil = new Sequtil();

describe('sequtil-genWhere', () => {
  describe('number', () => {
    it('error number', () => {
      const where = sequtil.genWhere({
        field1: '',
        field2: 'a'
      }, {
        field1: { type: Sequtil.Types.Number, op: 'eq' },
        field2: { type: Sequtil.Types.Number, op: 'eq' }
      });

      assert(!where.field1);
      assert(!where.field2);
    });

    it('one value', () => {
      const where = sequtil.genWhere({
        field1: '1',
        field2: '2'
      }, {
        field1: { type: Sequtil.Types.Number, op: Sequtil.Op.eq },
        field2: { type: Sequtil.Types.Number, op: Sequtil.Op.ne }
      });

      assert.deepEqual(where.field1, { [Sequtil.Op.eq]: 1 });
      assert.deepEqual(where.field2, { [Sequtil.Op.ne]: 2 });
    });

    it('two+ value', () => {
      const where = sequtil.genWhere({
        field1: '1,a',
        field2: '2,3'
      }, {
        field1: { type: Sequtil.Types.Number, op: Sequtil.Op.eq },
        field2: { type: Sequtil.Types.Number, op: Sequtil.Op.eq }
      });

      assert.deepEqual(where.field1[Sequtil.Op.or].length, 1);
      assert.deepEqual(where.field1[Sequtil.Op.or][0][Sequtil.Op.eq], 1);
      assert.deepEqual(where.field2[Sequtil.Op.or].length, 2);
      assert.deepEqual(where.field2[Sequtil.Op.or][0][Sequtil.Op.eq], 2);
      assert.deepEqual(where.field2[Sequtil.Op.or][1][Sequtil.Op.eq], 3);
    });
  });

  describe('string', () => {
    it('one value', () => {
      const where = sequtil.genWhere({
        field1: 'x',
        field2: 'x'
      }, {
        field1: { type: Sequtil.Types.String, op: Sequtil.Op.eq },
        field2: { type: Sequtil.Types.String, op: Sequtil.Op.like }
      });

      assert.deepEqual(where.field1[Sequtil.Op.eq], 'x');
      assert.deepEqual(where.field2[Sequtil.Op.like], sequtil.literal('x'));
    });

    it('two+ value', () => {
      const where = sequtil.genWhere({
        field1: 'x1,x2'
      }, {
        field1: { type: Sequtil.Types.String, op: Sequtil.Op.eq }
      });

      assert.deepEqual(where.field1[Sequtil.Op.or].length, 2);
      assert.deepEqual(where.field1[Sequtil.Op.or][0][Sequtil.Op.eq], 'x1');
      assert.deepEqual(where.field1[Sequtil.Op.or][1][Sequtil.Op.eq], 'x2');
    });
  });

  describe('date', () => {
    it('error date', () => {
      const where = sequtil.genWhere({
        field1: '',
        field2: 'a'
      }, {
        field1: { type: Sequtil.Types.Date, op: Sequtil.Op.eq },
        field2: { type: Sequtil.Types.Date, op: Sequtil.Op.eq }
      });

      assert(!where.field1);
      assert(!where.field2);
    });

    it('one value', () => {
      const date = new Date();

      const where = sequtil.genWhere({
        field1: date.toISOString(),
        field2: date.toISOString()
      }, {
        field1: { type: Sequtil.Types.Date, op: Sequtil.Op.eq },
        field2: { type: Sequtil.Types.Date, op: Sequtil.Op.ne }
      });

      assert.deepEqual(where.field1, { [Sequtil.Op.eq]: date });
      assert.deepEqual(where.field2, { [Sequtil.Op.ne]: date });
    });


    it('two+ value', () => {
      const date = new Date();

      const where = sequtil.genWhere({
        field1: `${date},a`,
        field2: `${date},${date}`
      }, {
        field1: { type: Sequtil.Types.Date, op: Sequtil.Op.eq },
        field2: { type: Sequtil.Types.Date, op: Sequtil.Op.eq }
      });

      assert.deepEqual(where.field1, { [Sequtil.Op.eq]: [date] });
      assert.deepEqual(where.field2, { [Sequtil.Op.ne]: [date, date] });
    });
  });
});

describe('sequtil-genCondWhere', () => {
  it('error filter', () => {
    const where1 = sequtil.genCondWhere(undefined, { field1: { type: Sequtil.Types.String } });
    assert.deepEqual(Object.keys(where1).length, 0);

    const where2 = sequtil.genCondWhere('[{ field: "field1", "op": eq, value: "x" }]', { field1: { type: Sequtil.Types.String } });
    assert.deepEqual(Object.keys(where2).length, 0);
  });

  describe('number', () => {
    it('error number', () => {
      const where = sequtil.genCondWhere(JSON.stringify([
        { field: 'field1', op: 'eq', value: 'a' },
        { field: 'field2', op: 'eq', value: true }
      ]), {
        field1: { type: Sequtil.Types.Number },
        field2: { type: Sequtil.Types.Number }
      });

      assert(!where.field1);
      assert(!where.field2);
    });

    it('one value', () => {
      const where = sequtil.genCondWhere(JSON.stringify([
        { field: 'field1', op: 'eq', value: 1 },
        { field: 'field2', op: 'ne', value: 2 }
      ]), {
        field1: { type: Sequtil.Types.Number },
        field2: { type: Sequtil.Types.Number }
      });

      assert.deepEqual(where.field1, { [Sequtil.Op.eq]: 1 });
      assert.deepEqual(where.field2, { [Sequtil.Op.ne]: 2 });
    });

    it('two+ value', () => {
      const where = sequtil.genCondWhere(JSON.stringify([
        { field: 'field1', op: 'eq', value: [1, 'a'] },
        { field: 'field2', op: 'eq', value: [2, 3] }
      ]), {
        field1: { type: Sequtil.Types.Number },
        field2: { type: Sequtil.Types.Number }
      });

      assert.deepEqual(where.field1, { [Sequtil.Op.eq]: [1] });
      assert.deepEqual(where.field2, { [Sequtil.Op.eq]: [2, 3] });
    });
  });

  describe('string', () => {
    it('error string', () => {
      const where = sequtil.genCondWhere(JSON.stringify([
        { field: 'field1', op: 'eq', value: 1 },
        { field: 'field2', op: 'eq', value: true }
      ]), {
        field1: { type: Sequtil.Types.String },
        field2: { type: Sequtil.Types.String }
      });

      assert(!where.field1);
      assert(!where.field2);
    });
  });

  it('one value', () => {
    const where = sequtil.genCondWhere(JSON.stringify([
      { field: 'field1', op: 'eq', value: 'x1' },
      { field: 'field2', op: 'like', value: 'x2' }
    ]), {
      field1: { type: Sequtil.Types.String },
      field2: { type: Sequtil.Types.String }
    });

    assert.deepEqual(where.field1, { [Sequtil.Op.eq]: 'x1' });
    assert.deepEqual(where.field2, { [Sequtil.Op.ne]: 'x2%' });
  });

  it('two+ value', () => {
    const where = sequtil.genCondWhere(JSON.stringify([
      { field: 'field1', op: 'eq', value: ['a', 1] },
      { field: 'field2', op: 'eq', value: ['a', 'b'] }
    ]), {
      field1: { type: Sequtil.Types.String },
      field2: { type: Sequtil.Types.String }
    });

    assert.deepEqual(where.field1, { [Sequtil.Op.eq]: ['a'] });
    assert.deepEqual(where.field2, { [Sequtil.Op.eq]: ['a', 'b'] });
  });
});
