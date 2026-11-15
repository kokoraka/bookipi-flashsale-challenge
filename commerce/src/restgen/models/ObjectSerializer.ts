export * from '../models/FileObject.js';
export * from '../models/Filter.js';
export * from '../models/GetAppInfoData.js';
export * from '../models/GetAppInfoResponse.js';
export * from '../models/GetFlashsaleProductByIdData.js';
export * from '../models/GetFlashsaleProductByIdInventory.js';
export * from '../models/GetFlashsaleProductByIdProduct.js';
export * from '../models/GetFlashsaleProductByIdResponse.js';
export * from '../models/GetFlashsalePromotionByIdData.js';
export * from '../models/GetFlashsalePromotionByIdPromotion.js';
export * from '../models/GetFlashsalePromotionByIdResponse.js';
export * from '../models/GetOrderByIdData.js';
export * from '../models/GetOrderByIdItem.js';
export * from '../models/GetOrderByIdOrder.js';
export * from '../models/GetOrderByIdResponse.js';
export * from '../models/ModelFile.js';
export * from '../models/PlaceOrderData.js';
export * from '../models/PlaceOrderOrder.js';
export * from '../models/PlaceOrderRequest.js';
export * from '../models/PlaceOrderResponse.js';
export * from '../models/RequestPagination.js';
export * from '../models/ResponseInfo.js';
export * from '../models/ResponseStatus.js';
export * from '../models/ResponseValidation.js';
export * from '../models/Sort.js';
export * from '../models/ValidationError.js';

import { FileObject } from '../models/FileObject.js';
import { Filter } from '../models/Filter.js';
import { GetAppInfoData } from '../models/GetAppInfoData.js';
import { GetAppInfoResponse } from '../models/GetAppInfoResponse.js';
import { GetFlashsaleProductByIdData } from '../models/GetFlashsaleProductByIdData.js';
import { GetFlashsaleProductByIdInventory } from '../models/GetFlashsaleProductByIdInventory.js';
import { GetFlashsaleProductByIdProduct } from '../models/GetFlashsaleProductByIdProduct.js';
import { GetFlashsaleProductByIdResponse } from '../models/GetFlashsaleProductByIdResponse.js';
import { GetFlashsalePromotionByIdData } from '../models/GetFlashsalePromotionByIdData.js';
import { GetFlashsalePromotionByIdPromotion } from '../models/GetFlashsalePromotionByIdPromotion.js';
import { GetFlashsalePromotionByIdResponse } from '../models/GetFlashsalePromotionByIdResponse.js';
import { GetOrderByIdData } from '../models/GetOrderByIdData.js';
import { GetOrderByIdItem } from '../models/GetOrderByIdItem.js';
import { GetOrderByIdOrder } from '../models/GetOrderByIdOrder.js';
import { GetOrderByIdResponse } from '../models/GetOrderByIdResponse.js';
import { ModelFile } from '../models/ModelFile.js';
import { PlaceOrderData } from '../models/PlaceOrderData.js';
import { PlaceOrderOrder } from '../models/PlaceOrderOrder.js';
import { PlaceOrderRequest } from '../models/PlaceOrderRequest.js';
import { PlaceOrderResponse } from '../models/PlaceOrderResponse.js';
import { RequestPagination } from '../models/RequestPagination.js';
import { ResponseInfo } from '../models/ResponseInfo.js';
import { ResponseStatus } from '../models/ResponseStatus.js';
import { ResponseValidation } from '../models/ResponseValidation.js';
import { Sort } from '../models/Sort.js';
import { ValidationError } from '../models/ValidationError.js';

/* tslint:disable:no-unused-variable */
let primitives = [
                    "string",
                    "boolean",
                    "double",
                    "integer",
                    "long",
                    "float",
                    "number",
                    "any"
                 ];

let enumsMap: Set<string> = new Set<string>([
]);

let typeMap: {[index: string]: any} = {
    "FileObject": FileObject,
    "Filter": Filter,
    "GetAppInfoData": GetAppInfoData,
    "GetAppInfoResponse": GetAppInfoResponse,
    "GetFlashsaleProductByIdData": GetFlashsaleProductByIdData,
    "GetFlashsaleProductByIdInventory": GetFlashsaleProductByIdInventory,
    "GetFlashsaleProductByIdProduct": GetFlashsaleProductByIdProduct,
    "GetFlashsaleProductByIdResponse": GetFlashsaleProductByIdResponse,
    "GetFlashsalePromotionByIdData": GetFlashsalePromotionByIdData,
    "GetFlashsalePromotionByIdPromotion": GetFlashsalePromotionByIdPromotion,
    "GetFlashsalePromotionByIdResponse": GetFlashsalePromotionByIdResponse,
    "GetOrderByIdData": GetOrderByIdData,
    "GetOrderByIdItem": GetOrderByIdItem,
    "GetOrderByIdOrder": GetOrderByIdOrder,
    "GetOrderByIdResponse": GetOrderByIdResponse,
    "ModelFile": ModelFile,
    "PlaceOrderData": PlaceOrderData,
    "PlaceOrderOrder": PlaceOrderOrder,
    "PlaceOrderRequest": PlaceOrderRequest,
    "PlaceOrderResponse": PlaceOrderResponse,
    "RequestPagination": RequestPagination,
    "ResponseInfo": ResponseInfo,
    "ResponseStatus": ResponseStatus,
    "ResponseValidation": ResponseValidation,
    "Sort": Sort,
    "ValidationError": ValidationError,
}

type MimeTypeDescriptor = {
    type: string;
    subtype: string;
    subtypeTokens: string[];
};

/**
 * Every mime-type consists of a type, subtype, and optional parameters.
 * The subtype can be composite, including information about the content format.
 * For example: `application/json-patch+json`, `application/merge-patch+json`.
 *
 * This helper transforms a string mime-type into an internal representation.
 * This simplifies the implementation of predicates that in turn define common rules for parsing or stringifying
 * the payload.
 */
const parseMimeType = (mimeType: string): MimeTypeDescriptor => {
    const [type = '', subtype = ''] = mimeType.split('/');
    return {
        type,
        subtype,
        subtypeTokens: subtype.split('+'),
    };
};

type MimeTypePredicate = (mimeType: string) => boolean;

// This factory creates a predicate function that checks a string mime-type against defined rules.
const mimeTypePredicateFactory = (predicate: (descriptor: MimeTypeDescriptor) => boolean): MimeTypePredicate => (mimeType) => predicate(parseMimeType(mimeType));

// Use this factory when you need to define a simple predicate based only on type and, if applicable, subtype.
const mimeTypeSimplePredicateFactory = (type: string, subtype?: string): MimeTypePredicate => mimeTypePredicateFactory((descriptor) => {
    if (descriptor.type !== type) return false;
    if (subtype != null && descriptor.subtype !== subtype) return false;
    return true;
});

// Creating a set of named predicates that will help us determine how to handle different mime-types
const isTextLikeMimeType = mimeTypeSimplePredicateFactory('text');
const isJsonMimeType = mimeTypeSimplePredicateFactory('application', 'json');
const isJsonLikeMimeType = mimeTypePredicateFactory((descriptor) => descriptor.type === 'application' && descriptor.subtypeTokens.some((item) => item === 'json'));
const isOctetStreamMimeType = mimeTypeSimplePredicateFactory('application', 'octet-stream');
const isFormUrlencodedMimeType = mimeTypeSimplePredicateFactory('application', 'x-www-form-urlencoded');

// Defining a list of mime-types in the order of prioritization for handling.
const supportedMimeTypePredicatesWithPriority: MimeTypePredicate[] = [
    isJsonMimeType,
    isJsonLikeMimeType,
    isTextLikeMimeType,
    isOctetStreamMimeType,
    isFormUrlencodedMimeType,
];

const nullableSuffix = " | null";
const optionalSuffix = " | undefined";
const arrayPrefix = "Array<";
const arraySuffix = ">";
const mapPrefix = "{ [key: string]: ";
const mapSuffix = "; }";

export class ObjectSerializer {
    public static findCorrectType(data: any, expectedType: string) {
        if (data == undefined) {
            return expectedType;
        } else if (primitives.indexOf(expectedType.toLowerCase()) !== -1) {
            return expectedType;
        } else if (expectedType === "Date") {
            return expectedType;
        } else {
            if (enumsMap.has(expectedType)) {
                return expectedType;
            }

            if (!typeMap[expectedType]) {
                return expectedType; // w/e we don't know the type
            }

            // Check the discriminator
            let discriminatorProperty = typeMap[expectedType].discriminator;
            if (discriminatorProperty == null) {
                return expectedType; // the type does not have a discriminator. use it.
            } else {
                if (data[discriminatorProperty]) {
                    var discriminatorType = data[discriminatorProperty];
                    let mapping = typeMap[expectedType].mapping;
                    if (mapping != undefined && mapping[discriminatorType]) {
                        return mapping[discriminatorType]; // use the type given in the discriminator
                    } else if(typeMap[discriminatorType]) {
                        return discriminatorType;
                    } else {
                        return expectedType; // discriminator did not map to a type
                    }
                } else {
                    return expectedType; // discriminator was not present (or an empty string)
                }
            }
        }
    }

    public static serialize(data: any, type: string, format: string): any {
        if (data == undefined) {
            return data;
        } else if (primitives.indexOf(type.toLowerCase()) !== -1) {
            return data;
        } else if (type.endsWith(nullableSuffix)) {
            let subType: string = type.slice(0, -nullableSuffix.length); // Type | null => Type
            return ObjectSerializer.serialize(data, subType, format);
        } else if (type.endsWith(optionalSuffix)) {
            let subType: string = type.slice(0, -optionalSuffix.length); // Type | undefined => Type
            return ObjectSerializer.serialize(data, subType, format);
        } else if (type.startsWith(arrayPrefix)) {
            let subType: string = type.slice(arrayPrefix.length, -arraySuffix.length); // Array<Type> => Type
            let transformedData: any[] = [];
            for (let date of data) {
                transformedData.push(ObjectSerializer.serialize(date, subType, format));
            }
            return transformedData;
        } else if (type.startsWith(mapPrefix)) {
            let subType: string = type.slice(mapPrefix.length, -mapSuffix.length); // { [key: string]: Type; } => Type
            let transformedData: { [key: string]: any } = {};
            for (let key in data) {
                transformedData[key] = ObjectSerializer.serialize(
                    data[key],
                    subType,
                    format,
                );
            }
            return transformedData;
        } else if (type === "Date") {
            if (!(data instanceof Date)) {
                return data;
            }
            if (format == "date") {
                let month = data.getMonth()+1
                let monthStr = month < 10 ? "0" + month.toString() : month.toString()
                let day = data.getDate();
                let dayStr = day < 10 ? "0" + day.toString() : day.toString();

                return data.getFullYear() + "-" + monthStr + "-" + dayStr;
            } else {
                return data.toISOString();
            }
        } else {
            if (enumsMap.has(type)) {
                return data;
            }
            if (!typeMap[type]) { // in case we dont know the type
                return data;
            }

            // Get the actual type of this object
            type = this.findCorrectType(data, type);

            // get the map for the correct type.
            let attributeTypes = typeMap[type].getAttributeTypeMap();
            let instance: {[index: string]: any} = {};
            for (let attributeType of attributeTypes) {
                const value = Object.prototype.hasOwnProperty.call(data, attributeType.name)
                    ? data[attributeType.name]
                    : data[attributeType.baseName];
                instance[attributeType.baseName] = ObjectSerializer.serialize(value, attributeType.type, attributeType.format);
            }
            return instance;
        }
    }

    public static deserialize(data: any, type: string, format: string): any {
        // polymorphism may change the actual type.
        type = ObjectSerializer.findCorrectType(data, type);
        if (data == undefined) {
            return data;
        } else if (primitives.indexOf(type.toLowerCase()) !== -1) {
            return data;
        } else if (type.endsWith(nullableSuffix)) {
            let subType: string = type.slice(0, -nullableSuffix.length); // Type | null => Type
            return ObjectSerializer.deserialize(data, subType, format);
        } else if (type.endsWith(optionalSuffix)) {
            let subType: string = type.slice(0, -optionalSuffix.length); // Type | undefined => Type
            return ObjectSerializer.deserialize(data, subType, format);
        } else if (type.startsWith(arrayPrefix)) {
            let subType: string = type.slice(arrayPrefix.length, -arraySuffix.length); // Array<Type> => Type
            let transformedData: any[] = [];
            for (let date of data) {
                transformedData.push(ObjectSerializer.deserialize(date, subType, format));
            }
            return transformedData;
        } else if (type.startsWith(mapPrefix)) {
            let subType: string = type.slice(mapPrefix.length, -mapSuffix.length); // { [key: string]: Type; } => Type
            let transformedData: { [key: string]: any } = {};
            for (let key in data) {
                transformedData[key] = ObjectSerializer.deserialize(
                    data[key],
                    subType,
                    format,
                );
            }
            return transformedData;
        } else if (type === "Date") {
            return new Date(data);
        } else {
            if (enumsMap.has(type)) {// is Enum
                return data;
            }

            if (!typeMap[type]) { // dont know the type
                return data;
            }
            let instance = new typeMap[type]();
            let attributeTypes = typeMap[type].getAttributeTypeMap();
            for (let attributeType of attributeTypes) {
                let value = ObjectSerializer.deserialize(data[attributeType.baseName], attributeType.type, attributeType.format);
                if (value !== undefined) {
                    instance[attributeType.name] = value;
                }
            }
            return instance;
        }
    }


    /**
     * Normalize media type
     *
     * We currently do not handle any media types attributes, i.e. anything
     * after a semicolon. All content is assumed to be UTF-8 compatible.
     */
    public static normalizeMediaType(mediaType: string | undefined): string | undefined {
        if (mediaType === undefined) {
            return undefined;
        }
        return (mediaType.split(";")[0] ?? '').trim().toLowerCase();
    }

    /**
     * From a list of possible media types, choose the one we can handle best.
     *
     * The order of the given media types does not have any impact on the choice
     * made.
     */
    public static getPreferredMediaType(mediaTypes: Array<string>): string {
        /** According to OAS 3 we should default to json */
        if (mediaTypes.length === 0) {
            return "application/json";
        }

        const normalMediaTypes = mediaTypes.map(ObjectSerializer.normalizeMediaType);

        for (const predicate of supportedMimeTypePredicatesWithPriority) {
            for (const mediaType of normalMediaTypes) {
                if (mediaType != null && predicate(mediaType)) {
                    return mediaType;
                }
            }
        }

        throw new Error("None of the given media types are supported: " + mediaTypes.join(", "));
    }

    /**
     * Convert data to a string according the given media type
     */
    public static stringify(data: any, mediaType: string): string {
        if (isTextLikeMimeType(mediaType)) {
            return String(data);
        }

        if (isJsonLikeMimeType(mediaType)) {
            return JSON.stringify(data);
        }

        throw new Error("The mediaType " + mediaType + " is not supported by ObjectSerializer.stringify.");
    }

    /**
     * Parse data from a string according to the given media type
     */
    public static parse(rawData: string, mediaType: string | undefined) {
        if (mediaType === undefined) {
            throw new Error("Cannot parse content. No Content-Type defined.");
        }

        if (isTextLikeMimeType(mediaType)) {
            return rawData;
        }

        if (isJsonLikeMimeType(mediaType)) {
            return JSON.parse(rawData);
        }

        throw new Error("The mediaType " + mediaType + " is not supported by ObjectSerializer.parse.");
    }
}
