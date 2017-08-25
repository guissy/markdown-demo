

const qs = require('qs');
const mockjs = require('mockjs');

// 数据持久
let loginData = {};
if (!global.loginData) {
  const data = mockjs.mock({
    'data|100': [
      {
        'id|+1': 1,
      },
    ],
    page: {
      total: 100,
      current: 1,
    },
    state: 0,
  });
  loginData = data;
  global.loginData = loginData;
} else {
  loginData = global.loginData;
}

module.exports = {

  'GET /api/login': function (req, res) {
    const page = qs.parse(req.query);
    const pageSize = page.pageSize || 10;
    const currentPage = page.page || 1;

    let data;
    let newPage;

    const newData = loginData.data.concat();

    if (page.field) {
      const d = newData.filter((item) => {
        return item[page.field].indexOf(page.keyword) > -1;
      });

      data = d.slice((currentPage - 1) * pageSize, currentPage * pageSize);

      newPage = {
        current: currentPage * 1,
        total: d.length,
      };
    } else {
      data = loginData.data.slice((currentPage - 1) * pageSize, currentPage * pageSize);
      loginData.page.current = currentPage * 1;
      newPage = {
        current: loginData.page.current,
        total: loginData.page.total,
      };
    }

    res.set('per-page', pageSize);
    res.set('page-number', currentPage);
    res.set('total', loginData.page.total);

    setTimeout(() => {
      res.json({
        ...loginData,
        data,
        page: newPage,
      });
    }, 500);
  },

  'POST /api/login': function (req, res) {
    setTimeout(() => {
      const newData = JSON.parse(req.body);

      newData.id = loginData.data.length + 1;
      loginData.data.unshift(newData);

      loginData.page.total = loginData.data.length;
      loginData.page.current = 1;

      global.loginData = loginData;
      res.json({ data: newData, state: 0 });
    }, 500);
  },

  'DELETE /api/login/:id': function (req, res) {
    setTimeout(() => {
      const deleteItem = { id: req.params.id };
      loginData.data = loginData.data.filter((item) => {
        if (item.id == deleteItem.id) {
          return false;
        }
        return true;
      });

      loginData.page.total = loginData.data.length;

      global.loginData = loginData;
      res.json({
        success: true,
        data: loginData.data,
        page: loginData.page,
      });
    }, 500);
  },

  'PUT /api/login/*': function (req, res) {
    setTimeout(() => {
      const editItem = JSON.parse(req.body);
      let okItem = editItem;
      loginData.data = loginData.data.map((item) => {
        if (item.id == editItem.id) {
          okItem = item;
          return editItem;
        }
        return item;
      });

      global.loginData = loginData;
      res.json({ data: okItem });
    }, 500);
  },

};
