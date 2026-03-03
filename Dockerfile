# Build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy csproj files and restore
COPY backend/src/FootballPrediction.Domain/FootballPrediction.Domain.csproj backend/src/FootballPrediction.Domain/
COPY backend/src/FootballPrediction.Application/FootballPrediction.Application.csproj backend/src/FootballPrediction.Application/
COPY backend/src/FootballPrediction.Infrastructure/FootballPrediction.Infrastructure.csproj backend/src/FootballPrediction.Infrastructure/
COPY backend/src/FootballPrediction.Api/FootballPrediction.Api.csproj backend/src/FootballPrediction.Api/

RUN dotnet restore backend/src/FootballPrediction.Api/FootballPrediction.Api.csproj

# Copy everything else and build
COPY backend/ backend/
WORKDIR /src/backend/src/FootballPrediction.Api
RUN dotnet publish -c Release -o /app/publish

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=build /app/publish .

# Expose port
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["dotnet", "FootballPrediction.Api.dll"]
