const Sequelize = require('sequelize');
const SqlString = require('sequelize/lib/sql-string');

const { Op } = Sequelize;

const Types = {
  Date: Symbol.for('date'),
  Number: Symbol.for('number'),
  String: Symbol.for('string')
};

class Sequtil {
  constructor(config) {
    this.config = {
      size: 50,
      maxSize: 500,
      minSize: 1,
      ...config
    };
  }

  setConfig(config) {
    this.config = Object.assign(this.config, config);
  }

  getConfig() {
    return this.config;
  }

  escape(str) {
    const val = SqlString.escape(str);

    return val.substr(1, val.length - 2);
  }

  literal(str) {
    const val = this.escape(str);

    return Sequelize.literal(`'${val}%'`);
  }

  genOrder(sort, options = {}) {
    if (!sort) {
      return options.default ? [options.default] : [];
    }

    const order = sort.split(',').map((kv) => kv.split(':')).filter((kv) => Object.prototype.hasOwnProperty.call(options, kv[0]) && ['asc', 'ASC', 'desc', 'DESC'].includes(kv[1]));

    return order;
  }

  genPage(params, options = {}) {
    const {
      size = this.config.size,
      maxSize = this.config.maxSize,
      minSize = this.config.minSize
    } = options;

    let page = parseInt(params.page, 10) || 1;
    let pageSize = parseInt(params.pageSize, 10);
    pageSize = Number.isInteger(pageSize) ? pageSize : size;

    page = page > 0 ? page : 1;

    if (pageSize > maxSize) {
      pageSize = maxSize;
    } else if (pageSize < minSize) {
      pageSize = minSize;
    }

    return {
      page,
      pageSize,
      limit: pageSize,
      offset: (page - 1) * pageSize
    };
  }

  genWhere(filters, definitions) {
    const where = {};

    const fields = Object.keys(definitions);
    fields.forEach((field) => {
      const definition = definitions[field];
      const {
        col = field,
        type,
        op
      } = definition;
      const value = filters[field];

      switch (type) {
        case Types.Number:
          if (value && value.indexOf(',') !== -1) {
            const vs = value.split(',').map((v) => parseInt(v, 10)).filter((v) => Number.isInteger(v));
            if (vs.length) {
              where[col] = {
                [Op.or]: vs.map((v) => ({ [op]: v }))
              };
            }
          } else {
            const val = parseInt(value, 10);
            if (Number.isInteger(val)) {
              where[col] = { [op]: val };
            }
          }

          break;
        case Types.String:
          if (typeof value !== 'string') {
            return;
          }

          if (value.indexOf(',') !== -1) {
            const vs = value.split(',').filter((v) => typeof v === 'string');
            if (vs.length) {
              where[col] = {
                [Op.or]: vs.map((v) => (op === Op.like ? { [op]: this.literal(v) } : { [op]: v }))
              };
            }
          } else {
            where[col] = op === Op.like ? { [op]: this.literal(value) } : { [op]: value };
          }

          break;
        case Types.Date:
          if (typeof value === 'string' && value.indexOf(',') !== -1) {
            const vs = value.split(',').map((v) => new Date(v)).filter((v) => v.toString() !== 'Invalid Date');
            if (vs.length) {
              where[col] = { [op]: vs };
            }
          } else {
            const val = new Date(value);
            if (val.toString() !== 'Invalid Date') {
              where[col] = where[col] || {};
              where[col][op] = value;
            }
          }

          break;
        default:
          break;
      }
    });

    return where;
  }

  genCondWhere(filters, definitions) {
    const where = {};
    let fts;

    if (typeof filters === 'string') {
      try {
        fts = JSON.parse(filters);
      } catch (err) {
        return where;
      }
    } else if (Array.isArray(filters)) {
      fts = filters;
    } else {
      return where;
    }

    fts.forEach((ft) => {
      const definition = definitions[ft.field];
      if (!(definition && ft.field && ft.op && Object.prototype.hasOwnProperty.call(ft, 'value'))) {
        return;
      }

      const { col = ft.field, cols } = definition;

      switch (definition.type) {
        case Types.Number:
          if (Array.isArray(ft.value)) {
            const vs = ft.value.filter((v) => Number.isInteger(v));
            if (vs.length) {
              where[col] = { [Op.in]: vs };
            }
          } else if (Number.isInteger(ft.value)) {
            where[col] = { [Op[`${ft.op}`]]: ft.value };
          }

          break;
        case Types.String:
          if (['eq', 'like'].indexOf(ft.op) === -1) {
            break;
          }

          if (cols && typeof ft.value === 'string') {
            const val = ft.value === 'like' ? this.literal(ft.value) : this.escape(ft.value);
            where[Op.or] = cols.map((c) => ({ [c]: { [Op[ft.op]]: val } }));
          } else if (typeof ft.value === 'string') {
            where[col] = { [Op[`${ft.op}`]]: ft.op === 'like' ? this.literal(ft.value) : this.escape(ft.value) };
          } else if (cols && Array.isArray(ft.value)) {
            if (!where[Op.and]) {
              where[Op.and] = { [Op.or]: [] };
            }

            cols.forEach((cl) => {
              const w = { [cl]: { [Op.or]: [] } };
              where[Op.and][Op.or].push(w);

              ft.value.forEach((val) => {
                if (typeof val === 'string') {
                  w[cl][Op.or].push({ [Op[`${ft.op}`]]: ft.op === 'like' ? this.literal(val) : this.escape(val) });
                }
              });
            });
          } else if (Array.isArray(ft.value)) {
            where[col] = { [Op.or]: [] };

            ft.value.forEach((val) => {
              if (typeof val === 'string') {
                where[col][Op.or].push({ [Op[`${ft.op}`]]: ft.op === 'like' ? this.literal(val) : this.escape(val) });
              }
            });
          }

          break;
        default:
          break;
      }
    });

    return where;
  }

  genOr(keyword, fields, op = 'like') {
    const or = [];

    const val = SqlString.escape(keyword);
    const kw = op === 'eq' ? val.substr(1, val.length - 2) : Sequelize.literal(`'%${val.substr(1, val.length - 2)}%'`);

    for (let i = 0; i < fields.length; i += 1) {
      or.push({ [fields[i]]: { [Op[op]]: kw } });
    }

    return or;
  }
}

Sequtil.Op = Op;
Sequtil.Types = Types;

module.exports = Sequtil;
