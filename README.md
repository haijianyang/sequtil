## Sequtil
Tool for API Filter and Pagination and Sort to Sequelize Where and Limit and Offset and Order.

Sequtil From [RESTful API Specification](https://shimo.im/docs/y6XVp3HxVPwcJ6QG)

## Install

```console
npm install sequtil
```

## Quick Start

```js
const sequtil = new Sequtil();

const query = {
  page: 1,
  pageSize: 1,
  sort: 'field1:asc',
  field1: '1',
  filters: JSON.stringify([
    { field: 'field1', op: 'eq', value: 1 }
  ])
};

// pagination
const page = sequtil.genPage(query); // { page: 1, pageSize: 1, limit: 1, offset: 0 }

// order
const order = sequtil.genOrder(query.sort, { field1: null }); // [ [ 'field1', 'asc' ] ]

// where
const where = sequtil.genWhere(query, {
  field1: { type: Sequtil.Types.Number, op: 'eq' }
}); // { field1: { [Symbol(eq)]: 1 } }

const condWhere = sequtil.genCondWhere(query.filters, {
  field1: { type: Sequtil.Types.Number }
}); // { field1: { [Symbol(eq)]: 1 } }
```

## Document

### Pagination

```js
// set config
const sequtil = new Sequtil({
  size: 20,
  maxSize: 100,
  minSize: 1
});

const page = sequtil.genPage({
  page: 1,
  pageSize: 101
}); // { page: 1, pageSize: 100, limit: 100, offset: 0 }

// override config
const page = sequtil.genPage({
  page: 1,
  pageSize: 101
}, {
  maxSize: 2
}); // { page: 1, pageSize: 2, limit: 2, offset: 0 }
```

### Sort
```js
const sequtil = new Sequtil();

// default order
const order = sequtil.genOrder(null, { default: ['id', 'ASC'] }); // [ [ 'id', 'ASC' ] ]

const query = {
  id: 123,
  name: 'xx'
};

const order = sequtil.(query.sort, { id: null, name: null }); // [ [ 'id', 'asc' ] ]
```

### Filter
```js
const sequtil = new Sequtil();

const query = {
  id: '123',
  name: 'xx'
};

const where = sequtil.genWhere(query, {
  id: { type: Sequtil.Types.Number, op: Sequtil.Op.eq },
  name: { type: Sequtil.Types.String, op: Sequtil.Op.like }
}); // { id: { [Symbol(eq)]: 123 }, name: { [Symbol(like)]: Literal { val: "'xx%'" } } }
```

### Complex Filter
```js
const sequtil = new Sequtil();

const query = {
  filters: JSON.stringify([
    { field: 'id', op: 'eq', value: [1, 2] },
    { field: 'name', op: 'like', value: 'xx' }
  ])
};

const where = sequtil.genCondWhere(query.filters, {
  id: { type: Sequtil.Types.Number },
  name: { type: Sequtil.Types.String }
}); // { id: { [Symbol(in)]: [ 1, 2 ] }, name: { [Symbol(like)]: Literal { val: "'xx%'" } } }
```

## API

### Sequtil.Op
The same as Sequelize [operators](https://sequelize.org/master/manual/model-querying-basics.html#operators)

### Sequtil.Types
The filter type

|Type|Description|
|-----|------
|`Date`|Symbol('date')|
|`Number`|Symbol('number')|
|`String`|Symbol('string')|

### Sequtil(config) Sequtil
Create Sequtil instance

**Parameters**
* `config` - _Object_ - The configuration for worker.
* `config.size` - _Int_ - Default pagination size.
* `config.maxSize` - _Int_ - Max pagination size.
* `config.minSize` - _Int_ - Min pagination size.

**Return**
* `Sequtil instance`

### Sequtil setConfig(config)
Set config

### Sequtil getConfig(config)
Get config

### Sequtil genOrder(sort, options = {}) Order
Generate order

**Parameters**
* `sort` - _String_ - The sort value, 'field1:asc', 'field2:DESC', etc.
* `options` - _Object_ - The sort value, 'field1:asc', 'field1:asc,field2:DESC', etc.
* `options.default` - _Array_ - The default Sequelize sort value, ['field1', 'ASC'], etc.
* `options.{field}` - _String_ - The Sequelize sort filed, 'id', 'name', etc.

**Return**
* [Sequelize Order](https://sequelize.org/master/manual/model-querying-basics.html#ordering)

### Sequtil genPage(params, options = {}) Pagination
Generate pagination

**Parameters**
* `params` - _Object_ - The page & pageSize, { page: 1, pageSize: 100 }, etc.
* `params.page` - _Int_ - Pagination page.
* `params.pageSize` - _Int_ - Pagination pageSize.
* `options` - _Object_ - The pagination config.
* `options.size` - _Int_ - Default pagination size, will override sequtil.config.size.
* `options.maxSize` - _Int_ - Max pagination size, will override sequtil.config.maxSize.
* `options.minSize` - _Int_ - Min pagination size, will override sequtil.config.minSize.

**Return**
* [Pagination](https://sequelize.org/master/manual/model-querying-basics.html#limits-and-pagination)
* `page` - _Int_ - Pagination page.
* `pageSize` - _Int_ - Pagination size.
* `limit` - _Int_ - Pagination limit.
* `offset` - _Int_ - Pagination offset.

### Sequtil genWhere(filters, definitions) Where
Generate Sequelize where

**Parameters**
* `filters` - _Object_ - The filters k-vs, { id: 123, name: 'xx' }, etc.
* `definitions` - _Object{Field-Definition}_ - The filter definitions, { id: { type: Sequtil.Types.Number, op: Sequtil.Op.eq } }, etc.
* `definition` - _Object_ - The filter definition.
* `definition.col` - _Object_ - The table col, optional, default to filed.
* `definition.type` - _Sequtil.Types_ - The filter type.
* `definition.op` - _Sequtil.Op_ - The operator.

**Return**
* [Sequelize Where](https://sequelize.org/master/manual/model-querying-basics.html#applying-where-clauses)

### Sequtil genCondWhere(filters, definitions) Where
Generate Sequelize where

**Parameters**
* `filters` - _String_ - The filters string '[fiter1, filter2, ...]', '[{"field":"id","op":"eq","value":1}, ...]', etc.
* `filter` - _Object_ - Single filter.
* `filter.field` - _String_ - The filter name.
* `filter.op` - _String_ - The filter operator, Sequtil.Op string.
* `filter.value` - _Any_ - The filter value, multiple values use array [v1, v2, ...].
* `definitions` - _Object{Field-Definition}_ - The filter definitions, { id: { type: Sequtil.Types.Number } }, etc.
* `definition` - _Object_ - The filter definition.
* `definition.col` - _Object_ - The table col, optional, default to filed.
* `definition.type` - _Sequtil.Types_ - The filter type.

**Return**
* [Sequelize Where]((https://sequelize.org/master/manual/model-querying-basics.html#applying-where-clauses))

## Best Practices
