const path = require('path')

module.exports = {
  schema: path.join(process.cwd(), 'prisma', 'schema.prisma'),
  datasource: {
    url: `file:${path.join(process.cwd(), 'prisma', 'dev.db')}`,
  },
}
