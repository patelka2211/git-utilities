export function affirmativeResponse<T>(data: T): {
    type: "SUCCESS";
    data: T;
    msg?: undefined;
} {
    return {
        type: "SUCCESS" as const,
        data,
    };
}

export function negativeResponse<T>(msg: T): {
    type: "ERROR";
    msg: T;
    data?: undefined;
} {
    return {
        type: "ERROR" as const,
        msg,
    };
}
