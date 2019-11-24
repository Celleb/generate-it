"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SwaggerUtils {
    /**
     * Converts a sub-section of a definition
     * @param {Object} param
     * @param {Object} [options] - options.isFromArray [string], options.requiredField [string[]]
     * @return {string|void}
     */
    pathParamsToJoi(param, options = {}) {
        if (!param) {
            console.log(param, options);
            return;
        }
        let validationText = param.name ? param.name + ':' : '';
        const isRequired = (options.requiredFields && options.requiredFields.includes(param.name)) || param.required;
        const type = param.type || param.schema.type;
        if (['string', 'number', 'integer', 'boolean'].includes(type)) {
            if (type === 'integer') {
                validationText += 'Joi.number().integer()';
            }
            else {
                validationText += 'Joi.' + type + '()';
            }
            if (type === 'string') {
                validationText += `.allow('')`;
            }
            if (param.default) {
                if (type === 'string') {
                    validationText += `.default('${param.default}')`;
                }
                else {
                    validationText += `.default(${param.default})`;
                }
            }
            if (param.enum || (param.schema && param.schema.enum)) {
                const enumValues = param.enum || param.schema.enum;
                validationText += '.valid([' + enumValues.map((e) => `'${e}'`).join(', ') + '])';
            }
            if (param.minLength) {
                validationText += (param.minLength ? `.min(${+param.minLength})` : '');
            }
            if (param.minimum) {
                validationText += (param.minimum ? `.min(${+param.minimum})` : '');
            }
            if (param.maxLength) {
                validationText += (param.maxLength ? `.max(${+param.maxLength})` : '');
            }
            if (param.maximum) {
                validationText += (param.maximum ? `.max(${+param.maximum})` : '');
            }
            if (type === 'string' && param.pattern) {
                validationText += (param.pattern ? `.regex(/${param.pattern}/)` : '');
            }
            validationText += (isRequired ? '.required()' : '') + (!options.isFromArray ? ',' : '');
        }
        else if (type === 'array') {
            validationText += 'Joi.array().items(';
            validationText += this.pathParamsToJoi(param.schema ? param.schema.items : param.items, {
                isFromArray: true,
            });
            validationText += ')';
            if (param.minItems) {
                validationText += (param.minItems ? `.min(${+param.minItems})` : '');
            }
            if (param.maxItems) {
                validationText += (param.maxItems ? `.max(${+param.maxItems})` : '');
            }
            validationText += (isRequired ? '.required(),' : ',');
        }
        else if (param.properties || param.schema) {
            const properties = param.properties || param.schema.properties || {};
            validationText += 'Joi.object({';
            Object.keys(properties).forEach((propertyKey) => {
                validationText += this.pathParamsToJoi(Object.assign({ name: propertyKey }, properties[propertyKey]));
            });
            validationText += '})' + (isRequired ? '.required()' : '') + (!options.isFromArray ? ',' : '');
        }
        else {
            validationText += 'Joi.any()' + (isRequired ? '.required()' : '') + (!options.isFromArray ? ',' : '');
        }
        return validationText;
    }
    /**
     * Iterates over the request params from an OpenAPI path and returns Joi validation syntax for a validation class.
     * @param {Object} requestParams
     * @return {string|void}
     */
    createJoiValidation(requestParams) {
        if (!requestParams) {
            return;
        }
        const paramsTypes = {
            body: requestParams.filter((param) => param.in === 'body'),
            params: requestParams.filter((param) => param.in === 'path'),
            query: requestParams.filter((param) => param.in === 'query'),
        };
        let validationText = '';
        Object.keys(paramsTypes).forEach((paramTypeKey) => {
            if (paramsTypes[paramTypeKey].length === 0) {
                return;
            }
            validationText += paramTypeKey + ': {';
            paramsTypes[paramTypeKey].forEach((param) => {
                if (param.schema && param.schema.properties) {
                    Object.keys(param.schema.properties).forEach((propertyKey) => {
                        validationText += this.pathParamsToJoi(Object.assign({ name: propertyKey }, param.schema.properties[propertyKey]), {
                            requiredFields: param.schema.required,
                        });
                    });
                }
                else if (param.type || (param.schema && param.schema.type)) {
                    validationText += this.pathParamsToJoi(param);
                }
            });
            validationText += '},';
        });
        return validationText;
    }
}
exports.default = new SwaggerUtils();