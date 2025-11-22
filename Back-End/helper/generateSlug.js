const { Op } = require('sequelize');

function toSlug(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

async function generateUniqueSlug(Model, name, idToExclude = null) {
  let baseSlug = toSlug(name);
  let slug = baseSlug;
  let count = 1;

  while (true) {
    const where = { products_slug: slug };
    if (idToExclude) {
      where.id_products = { [Op.ne]: idToExclude };
    }

    const existing = await Model.findOne({ where });

    if (!existing) {
      break;
    }

    slug = `${baseSlug}-${count}`;
    count++;
  }

  return slug;
}

module.exports = {
  toSlug,
  generateUniqueSlug,
};
