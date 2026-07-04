const test = require('node:test');
const assert = require('node:assert/strict');
const { getProductQueryContext, getOrderQueryContext } = require('../services/chatbotService');

test('detects shirt inventory questions', () => {
  const context = getProductQueryContext('what colors are available for shirts');

  assert.equal(context.category, 'shirts');
  assert.ok(context.actions.includes('colors'));
});

test('detects highest price requests', () => {
  const context = getProductQueryContext('what is the highest price of shirts');

  assert.equal(context.category, 'shirts');
  assert.ok(context.actions.includes('highest_price'));
});

test('detects order list requests', () => {
  const context = getOrderQueryContext('show my orders');

  assert.equal(context.isOrderQuery, true);
  assert.equal(context.isOrderListQuery, true);
});
