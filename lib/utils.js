'use strict';

exports = module.exports = {};

exports.getLinkHref = function (result, linkRel) {
  if (result._links && result._links[linkRel]) {
    return result._links[linkRel].href;
  }
  return undefined;
};

exports.getLinkItemHref = function (result, itemIndex) {
  if (result._links && result._links.items && result._links.items.length > itemIndex) {
    return result._links.items[itemIndex].href;
  }
  return undefined;
};

exports.getEmbedded = function (result, linkRel) {
  if (result._embedded) {
    return result._embedded[linkRel];
  }
  return undefined;
};
