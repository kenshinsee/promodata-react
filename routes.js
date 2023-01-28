const routes = require('next-routes')()

routes.add('/requests', '/requests/index')
      .add('/requests/new', '/requests/new')
      .add('/requests/:address', '/requests/show')
      .add('/requests/:address/promodetail', '/requests/promodetail')

module.exports = routes