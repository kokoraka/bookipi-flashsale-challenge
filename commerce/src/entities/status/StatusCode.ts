export enum StatusCode {
    // credential being submited to have access is invalid
    AUTHN_INVALID_CREDENTIAL = "AUTHN.INVALID_CREDENTIAL",
    // unauhtorized access to the system
    AUTHN_UNAUTHORIZED = "AUTHN.UNAUTHORIZED",
    // have access to the system, but don't have access to the requested resource
    AUTHZ_FORBIDDEN = "AUTHZ.FORBIDDEN",
    // request is success but pending system to do the action
    PENDING = "PENDING",
    // resource already exists in the system
    RESOURCE_ALREADY_EXISTS = "RESOURCE.ALREADY_EXISTS",
    // resource could not be found in the system
    RESOURCE_NOT_FOUND = "RESOURCE.NOT_FOUND",
    // general success
    SUCCESS = "SUCCESS",
    // system unable to call to the respective party (internal or external system)
    SYSTEM_COMMUNICATION_FAILURE = "SYSTEM.COMMUNICATION_FAILURE",
    // system unable to call to the respective party after several times
    SYSTEM_COMMUNICATION_TIMEOUT = "SYSTEM.COMMUNICATION_TIMEOUT",
    // system producing internal error
    SYSTEM_INTERNAL_ERROR = "SYSTEM.INTERNAL_ERROR",
    // system producing unknown error
    SYSTEM_UNKNOWN_ERROR = "SYSTEM.UNKNOWN_ERROR",
        // system producing unknown error
    SYSTEM_UNAVAILABLE = "SYSTEM.UNAVAILABLE",
    // unable to parse inputted data
    VALIDATION_INVALID_INPUT = "VALIDATION.INVALID_INPUT",
    // request is present but there's invalid data being sent by client
    VALIDATION_INVALID_PARAM = "VALIDATION.INVALID_PARAM",
    // current state of the resource is not valid
    VALIDATION_INVALID_STATE = "VALIDATION.INVALID_STATE",
}

export const StatusMessages: Record<StatusCode, string> = {
    [StatusCode.AUTHN_INVALID_CREDENTIAL]: "Invalid credential",
    [StatusCode.AUTHN_UNAUTHORIZED]: "Unauthenticated access",
    [StatusCode.AUTHZ_FORBIDDEN]: "Insufficient authorization",
    [StatusCode.PENDING]: "Pending",
    [StatusCode.RESOURCE_ALREADY_EXISTS]: "Resource exists",
    [StatusCode.RESOURCE_NOT_FOUND]: "Resource not found",
    [StatusCode.SUCCESS]: "Success",
    [StatusCode.SYSTEM_COMMUNICATION_FAILURE]: "communication failure",
    [StatusCode.SYSTEM_COMMUNICATION_TIMEOUT]: "timeout exceeded",
    [StatusCode.SYSTEM_INTERNAL_ERROR]: "Internal server error",
    [StatusCode.SYSTEM_UNKNOWN_ERROR]: "Internal server error",
    [StatusCode.SYSTEM_UNAVAILABLE]: "System unavailable",
    [StatusCode.VALIDATION_INVALID_INPUT]: "Invalid input data",
    [StatusCode.VALIDATION_INVALID_PARAM]: "One or more fields are invalid",
    [StatusCode.VALIDATION_INVALID_STATE]: "One or more fields are on invalid state",
};