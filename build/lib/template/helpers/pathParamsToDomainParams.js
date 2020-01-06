"use strict";
exports.__esModule = true;
var tslib_1 = require("tslib");
var ucFirst_1 = tslib_1.__importDefault(require("./ucFirst"));
function addType(withType, pathObject, requestType, forceType) {
    if (!withType) {
        return '';
    }
    if (!forceType && requestType && pathObject['x-request-definitions'] && pathObject['x-request-definitions'][requestType]) {
        if (requestType === 'body') {
            return ': ' + ucFirst_1["default"](pathObject['x-request-definitions'][requestType].params[0].name);
        }
        return ': ' + pathObject['x-request-definitions'][requestType].name;
    }
    return ': ' + ((forceType) ? forceType : 'any');
}
/**
 * Provides parameters for controller and domain functions.
 * Will auto inject the req.jwtData if the path has a security attribute.
 * @param pathObject The full value of the path object
 * @param {boolean | object} withType If true will inject the typescript type any
 * @param {boolean} withPrefix
 * @param pathNameChange
 * @returns {string}
 */
function default_1(pathObject, withType, withPrefix, pathNameChange) {
    if (withType === void 0) { withType = false; }
    if (pathNameChange === void 0) { pathNameChange = 'path'; }
    if (!pathObject) {
        return '';
    }
    var params = [];
    if (pathObject.parameters) {
        if (pathObject.parameters.some(function (p) { return p["in"] === 'query'; })) {
            params.push('query' + addType(withType, pathObject, 'query'));
        }
        if (pathObject.parameters.some(function (p) { return p["in"] === 'path'; })) {
            params.push(pathNameChange + addType(withType, pathObject, 'path'));
        }
        if (pathObject.parameters.some(function (p) { return p["in"] === 'body'; })) {
            params.push('body' + addType(withType, pathObject, 'body'));
        }
        if (pathObject.parameters.some(function (p) { return p["in"] === 'headers'; })) {
            params.push('headers' + addType(withType, pathObject, 'headers'));
        }
        if (pathObject.parameters.some(function (p) { return p["in"] === 'formData'; })) {
            params.push('files' + addType(withType, pathObject, 'formData'));
        }
    }
    var helpers = (this.ctx && this.ctx.config.data.nodegenRc.helpers) ? this.ctx.config.data.nodegenRc.helpers : undefined;
    var fileType = (this.ctx && this.ctx.fileType) ? this.ctx.fileType : undefined;
    var stubHelpers = (helpers && helpers.stub) ? helpers.stub : undefined;
    if (pathObject.security) {
        var push_1 = false;
        pathObject.security.forEach(function (security) {
            Object.keys(security).forEach(function (key) {
                if (key.toLowerCase().includes('jwt')) {
                    push_1 = true;
                }
            });
        });
        if (push_1) {
            if (fileType === 'STUB') {
                params.push('jwtData' + addType(withType, pathObject, undefined, (stubHelpers && stubHelpers.jwtType) ? stubHelpers.jwtType : undefined));
            }
            else {
                params.push('jwtData' + addType(withType, pathObject));
            }
        }
    }
    if (pathObject['x-passRequest']) {
        if (fileType === 'STUB') {
            params.push('req' + addType(withType, pathObject, undefined, (stubHelpers && stubHelpers.requestType) ? stubHelpers.requestType : undefined));
        }
        else {
            params.push('req' + addType(withType, pathObject));
        }
    }
    params.sort();
    if (withPrefix) {
        params = params.map(function (p) { return (p === 'req') ? 'req' : 'req.' + p; });
    }
    return params.join(', ') + ((withType && params.length > 0) ? ',' : '');
}
exports["default"] = default_1;
