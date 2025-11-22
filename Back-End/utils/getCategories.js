const { Category } = require("../models/index.model")

async function getAllChildCategoryIds(parentId) {
  const all = await Category.findAll({ attributes: ["category_id", "parent_id"] });

  const result = new Set();
  const queue = [parseInt(parentId)];

  while (queue.length > 0) {
    const current = queue.shift();
    result.add(current);

    const children = all.filter(c => c.parent_id === current);
    children.forEach(child => queue.push(child.category_id));
  }

  return Array.from(result);
}

module.exports = getAllChildCategoryIds;