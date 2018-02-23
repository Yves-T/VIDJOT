if (process.env.NODE_ENV === 'production') {
  module.exports = {
    monogURI: 'mongodb://your-mongo-production-url-here',
  };
} else {
  module.exports = {
    monogURI: 'mongodb://localhost/vidjot-dev',
  };
}
