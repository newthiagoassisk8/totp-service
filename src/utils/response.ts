export function success<T>(data: T) {
    return { success: true, data };
}

export function error(message: string, code = 400) {
    return { success: false, error: message, code };
}
