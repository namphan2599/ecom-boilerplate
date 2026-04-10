export declare class ApiErrorResponseDto {
    statusCode: number;
    timestamp: string;
    path: string;
    method: string;
    message: string | string[];
}
export declare class ValidationErrorResponseDto extends ApiErrorResponseDto {
    message: string[];
}
