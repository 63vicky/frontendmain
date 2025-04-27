const mcache = require('memory-cache');

// Cache duration in seconds
const CACHE_DURATION = {
  SHORT: 300,    // 5 minutes
  MEDIUM: 1800,  // 30 minutes
  LONG: 3600,    // 1 hour
};

// Cache middleware
const cache = (duration) => {
  return (req, res, next) => {
    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = '__express__' + req.originalUrl;
    const cachedBody = mcache.get(key);
    
    if (cachedBody) {
      res.send(cachedBody);
      return;
    }
    
    res.sendResponse = res.send;
    res.send = (body) => {
      mcache.put(key, body, duration * 1000);
      res.sendResponse(body);
    };
    next();
  };
};

// Clear cache for specific route
const clearCache = (route) => {
  const key = '__express__' + route;
  mcache.del(key);
};

// Clear all cache
const clearAllCache = () => {
  mcache.clear();
};

module.exports = {
  cache,
  clearCache,
  clearAllCache,
  CACHE_DURATION
}; 