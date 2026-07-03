const app = require('./index.js');
const reviewRoutes = require('./routes/reviewRoutes');

console.log('reviewRoutes stack length:', reviewRoutes.stack.length);
reviewRoutes.stack.forEach((layer, i) => {
  console.log('review layer', i, layer.name, layer.route ? layer.route.path : '<no-route>', layer.regexp ? layer.regexp.toString() : '<no-regexp>');
  if (layer.route) console.log('  methods', Object.keys(layer.route.methods));
});

const stack = (app.router && Array.isArray(app.router.stack)) ? app.router.stack : [];
console.log('app.router stack length:', stack.length);
stack.forEach((layer, i) => {
  console.log('app layer', i, layer.name, layer.route ? layer.route.path : (layer.regexp ? layer.regexp.toString() : '<no-regexp>'));
  if (layer.handle && layer.handle.stack) {
    console.log('  nested stack length', layer.handle.stack.length);
    layer.handle.stack.forEach((nested, j) => {
      console.log('   nested', j, nested.name, nested.route ? nested.route.path : (nested.regexp ? nested.regexp.toString() : '<no-regexp>'));
      if (nested.route) console.log('     methods', Object.keys(nested.route.methods));
    });
  }
});
