# Multi-stage build for .NET 9 backend

# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy solution and project files
COPY backend/*.sln ./
COPY backend/src/FootballPrediction.Api/*.csproj ./src/FootballPrediction.Api/
COPY backend/src/FootballPrediction.Application/*.csproj ./src/FootballPrediction.Application/
COPY backend/src/FootballPrediction.Domain/*.csproj ./src/FootballPrediction.Domain/
COPY backend/src/FootballPrediction.Infrastructure/*.csproj ./src/FootballPrediction.Infrastructure/

# Restore dependencies (API project only, tests excluded via .dockerignore)
RUN dotnet restore src/FootballPrediction.Api/FootballPrediction.Api.csproj

# Copy source projects and build
COPY backend/src/ ./src/
RUN dotnet publish src/FootballPrediction.Api/FootballPrediction.Api.csproj -c Release -o /app/publish --no-restore

# Stage 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app

# Copy published files from build stage
COPY --from=build /app/publish .

# Expose port 8080 (Render default)
EXPOSE 8080

# Set environment variable for Kestrel
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

# Run the application
ENTRYPOINT ["dotnet", "FootballPrediction.Api.dll"]
