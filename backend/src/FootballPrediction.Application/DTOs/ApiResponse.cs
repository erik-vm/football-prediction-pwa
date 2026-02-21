namespace FootballPrediction.Application.DTOs;

public class ApiResponse<T>
{
    public T? Data { get; set; }
    public string? Message { get; set; }
    public string[]? Errors { get; set; }

    public static ApiResponse<T> Success(T data, string? message = null)
    {
        return new ApiResponse<T>
        {
            Data = data,
            Message = message
        };
    }

    public static ApiResponse<T> Error(string message, string[]? errors = null)
    {
        return new ApiResponse<T>
        {
            Message = message,
            Errors = errors
        };
    }
}
